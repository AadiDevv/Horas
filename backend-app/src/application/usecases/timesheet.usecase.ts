import { TimesheetUpdateDTO, TimesheetFilterDTO, TimesheetStatsDTO, TimesheetCreateDTO,  AuthContext } from "@/application/DTOS";
import { Timesheet, Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";
import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { NotFoundError, ForbiddenError, ValidationError } from "@/domain/error/AppError";
import { TimesheetMapper } from "@/application/mappers/";
import { IUser } from "@/domain/interfaces/user.interface";

/**
 * Use Case pour la gestion des timesheets
 * Contient la logique métier et les règles de gestion
 */
export class TimesheetUseCase {

    constructor(private readonly R_timesheet: ITimesheet, private readonly R_user: IUser) { }

    // #region Read

    /**
     * Récupère les timesheets selon le rôle de l'utilisateur
     *
     * Logique :
     * - Admin : peut filtrer tous les timesheets
     * - Manager : peut filtrer uniquement par employés de son équipe
     * - Employé : ne peut voir que ses propres timesheets
     *
     * @param userRole - Rôle de l'utilisateur
     * @param userId - ID de l'utilisateur connecté
     * @param filter - Filtres optionnels
     */
    async getTimesheets(userRole: string, userId: number, filter?: TimesheetFilterDTO): Promise<Timesheet_Core[]> {
        let effectiveFilter: TimesheetFilterDTO = { ...filter };

        if (userRole === "employe") {
            // L'employé ne peut voir que ses propres timesheets
            effectiveFilter.employeId = userId;
        } else if (userRole === "manager" && filter?.employeId) {
            // Vérifier que l'employé demandé appartient bien au manager
            await this.validateManagerOwnership(filter.employeId, userRole, userId);
        }

        return await this.R_timesheet.getAllTimesheets(effectiveFilter);
    }

    /**
     * Récupère un timesheet par son ID
     */
    async getTimesheetById(id: number, userRole: string, userId: number): Promise<Timesheet> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);

        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Vérifier les permissions selon le rôle
        if (userRole === "employe" && timesheet.employeId !== userId) {
            throw new ForbiddenError("Accès interdit à ce timesheet");
        }

        // Vérifier que le manager gère bien cet employé
        await this.validateManagerOwnership(timesheet.employeId, userRole, userId);

        return timesheet;
    }

    async getLastTimesheetByEmployee(employeId: number): Promise<Timesheet | null> {
        const timesheet = await this.R_timesheet.getLastByEmployee(employeId);

       return timesheet;
    }

    /**
     * Récupère les statistiques de timesheets d'un employé
     */
    async getTimesheetStats(employeId: number, startDate: string, endDate: string, userRole: string, userId: number): Promise<TimesheetStatsDTO> {
        if (userRole === "employe" && employeId !== userId) {
            throw new ForbiddenError("Vous ne pouvez consulter que vos propres statistiques");
        }

        // Vérifier que le manager gère bien cet employé
        await this.validateManagerOwnership(employeId, userRole, userId);

        return await this.R_timesheet.getTimesheetStats(employeId, startDate, endDate);
    }

    // #endregion

    // #region Create

    /**
     * Crée un nouveau timesheet avec logique métier complète
     * - Détermine l'employé cible selon le rôle
     * - Auto-détermine clockin/clockout pour les employés
     * - Valide et enregistre le timesheet
     *
     * @param dto - Données métier du timesheet à créer
     * @param auth - Contexte d'authentification (userId, userRole)
     * @returns Timesheet complet (après insertion, avec employe)
     */
    async createTimesheet(dto: TimesheetCreateDTO, auth: AuthContext): Promise<Timesheet_Core> {
        const { userRole, userId } = auth;

        // Déterminer l'employé cible
        let targetEmployeeId: number;
        if ((userRole === 'manager' || userRole === 'admin')) {
            // Manager/Admin peut créer pour un autre employé
            if( dto.employeId){
                // Vérifier que le manager gère bien cet employé
                await this.validateManagerOwnership(dto.employeId, userRole, userId);
                targetEmployeeId = dto.employeId;
            } else {
                throw new ValidationError("L'employé cible est requis");
            }
        } else {
            // Employé crée pour lui-même
            targetEmployeeId = userId;
        }

        // Déterminer le timestamp
        let timestamp: Date;
        if (userRole === 'employe') {
            // Employé : timestamp automatique (temps réel)
            timestamp = new Date();
        } else {
            // Manager/Admin : peut spécifier ou auto
            timestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();
        }

        // Récupérer le dernier timesheet pour validation et auto-détermination du clockin
        const lastTimesheet = await this.getLastTimesheetByEmployee(targetEmployeeId);


        // Validation : le nouveau timestamp doit être après le dernier
        this.validateTimestampChronology(lastTimesheet, timestamp);

        // Auto-déterminer le sens du pointage (toujours auto, pas de choix)
        const clockin: boolean = !lastTimesheet ? true : !lastTimesheet.clockin;

        // Instancier l'entité Timesheet_Core
        const timesheet = new Timesheet_Core({
            id: 0,
            timestamp,
            clockin,
            status: dto.status ?? 'normal',
            employeId: targetEmployeeId,
        });

        // Validation et enregistrement
        timesheet.validate();
        return await this.R_timesheet.createTimesheet(timesheet);
    }

    // #endregion

    // #region Update

    /**
     * Met à jour un timesheet existant
     * - Employé ne peut PAS modifier un timesheet
     * - Admin/manager uniquement
     * - Manager ne peut modifier que les timesheets de ses employés
     */
    async updateTimesheet(id: number, dto: TimesheetUpdateDTO, userRole: string, userId: number): Promise<Timesheet_L1> {
        const existing = await this.R_timesheet.getTimesheetById(id);
        if (!existing) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Vérifier que le manager gère bien cet employé
        await this.validateManagerOwnership(existing.employeId, userRole, userId);

        if (dto.timestamp) {
            this.validateTimestampChronology(existing, new Date(dto.timestamp));
        }

        const timeSheetEntityUpdated = TimesheetMapper.FromDTO.Update_ToEntity(existing, dto);
        timeSheetEntityUpdated.validate();

        return await this.R_timesheet.updateTimesheet_ById(timeSheetEntityUpdated);
    }

    // #endregion

    // #region Delete

    /**
     * Supprime un timesheet (admin/manager uniquement)
     * - Manager ne peut supprimer que les timesheets de ses employés
     */
    async deleteTimesheet(id: number, userRole: string, userId: number): Promise<void> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);
        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Vérifier que le manager gère bien cet employé
        await this.validateManagerOwnership(timesheet.employeId, userRole, userId);

        await this.R_timesheet.deleteTimesheet_ById(id);
    }

    // #endregion

    // #region Utils

    /**
     * Vérifie qu'un manager gère bien l'employé cible
     * @throws ForbiddenError si le manager ne gère pas cet employé
     * @throws NotFoundError si l'employé n'existe pas
     */
    private async validateManagerOwnership(employeId: number, userRole: string, userId: number): Promise<void> {
        if (userRole === 'manager') {
            const employee = await this.R_user.getEmployee_ById(employeId);
            if (!employee) {
                throw new NotFoundError(`Employé avec l'ID ${employeId} introuvable`);
            }
            if (employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez accéder qu'aux ressources de vos employés");
            }
        }
    }

    private validateTimestampChronology(lastTimesheet: Timesheet_Core | null, timestamp: Date): void {
        // Validation : le nouveau timestamp doit être après le dernier
        if (lastTimesheet && timestamp <= lastTimesheet.timestamp) {
            // Formater la date en français pour l'utilisateur

            const lastDate = lastTimesheet.timestamp;
            const formattedDate = lastDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedTime = lastDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            throw new ValidationError(
                `Le pointage doit être postérieur au dernier pointage effectué le ${formattedDate} à ${formattedTime}`
            );
        }
    }
    // #endregion
}
