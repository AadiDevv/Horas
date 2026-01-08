import { TimesheetUpdateDTO, TimesheetFilterDTO, TimesheetStatsDTO, TimesheetCreateDTO, TimesheetPairUpdateDTO } from "@/application/DTOS";
import { Timesheet, Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";
import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { NotFoundError, ValidationError } from "@/domain/error/AppError";
import { TimesheetMapper } from "@/application/mappers/";
import { IUser } from "@/domain/interfaces/user.interface";
import { UserAuthDTO } from '@/application/DTOS';
import { PaireTimeSheet } from "@/application/types/paireTimeSheet";
import { TimesheetValidationService } from "@/application/services/timesheet-validation.service";
import { AuthorizationService } from "@/application/services/authorization.service";

/**
 * Use Case pour la gestion des timesheets
 * Orchestre la logique métier CRUD et délègue les validations aux services
 */
export class TimesheetUseCase {

    private readonly validationService: TimesheetValidationService;
    private readonly authorizationService: AuthorizationService;

    constructor(
        private readonly R_timesheet: ITimesheet,
        private readonly R_user: IUser
    ) {
        this.validationService = new TimesheetValidationService(R_timesheet);
        this.authorizationService = new AuthorizationService(R_user);
    }

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
    async getTimesheets(authUser: UserAuthDTO, filter?: TimesheetFilterDTO): Promise<Timesheet_Core[]> {
        let effectiveFilter: TimesheetFilterDTO = { ...filter };

        if (authUser.role === "employe") {
            // L'employé ne peut voir que ses propres timesheets
            effectiveFilter.employeId = authUser.id;
        } else if (authUser.role === "manager" && filter?.employeId) {
            // Vérifier que l'employé demandé appartient bien au manager
            await this.authorizationService.validateManagerOwnership(filter.employeId, authUser);
        }

        return await this.R_timesheet.getAllTimesheets(effectiveFilter);
    }

    /**
     * Récupère un timesheet par son ID
     */
    async getTimesheetById(id: number, authUser: UserAuthDTO): Promise<Timesheet> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);

        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Vérifier les permissions selon le rôle
        this.authorizationService.validateEmployeeAccess(timesheet.employeId, authUser);

        // Vérifier que le manager gère bien cet employé
        await this.authorizationService.validateManagerOwnership(timesheet.employeId, authUser);

        return timesheet;
    }


    /**
     * Récupère les statistiques de timesheets d'un employé
     */
    async getTimesheetStats(employeId: number, startDate: string, endDate: string, authUser: UserAuthDTO): Promise<TimesheetStatsDTO> {
        this.authorizationService.validateEmployeeAccess(employeId, authUser);
        await this.authorizationService.validateManagerOwnership(employeId, authUser);

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
    async createTimesheet(dto: TimesheetCreateDTO, authUser: UserAuthDTO): Promise<Timesheet_Core> {
        console.log('🔵 createTimesheet - Début', { dto, authUser });

        // Déterminer l'employé cible
        let targetEmployeeId: number;
        if ((authUser.role === 'manager' || authUser.role === 'admin')) {
            // Manager/Admin peut créer pour un autre employé
            if( dto.employeId){
                console.log('🔵 Validation manager ownership pour employé:', dto.employeId);
                // Vérifier que le manager gère bien cet employé
                await this.authorizationService.validateManagerOwnership(dto.employeId, authUser);
                console.log('✅ Validation manager ownership OK');
                targetEmployeeId = dto.employeId;
            } else {
                throw new ValidationError("L'employé cible est requis");
            }
        } else {
            // Employé crée pour lui-même
            targetEmployeeId = authUser.id;
        }

        // Déterminer le timestamp
        let timestamp: Date;
        if (authUser.role === 'employe') {
            // Employé : timestamp automatique (temps réel)
            // On utilise directement new Date() car on veut l'heure locale du serveur
            // Le serveur doit être configuré dans le bon fuseau horaire
            timestamp = new Date();
        } else {
            // Manager/Admin : peut spécifier ou auto
            timestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();
        }

        // Récupérer le dernier timesheet pour validation et auto-détermination du clockin
        const lastTimesheet = await this.R_timesheet.getLastByEmployee(targetEmployeeId);

        // Validation : le nouveau timestamp doit être après le dernier
        this.validationService.validateTimestampChronology(lastTimesheet, timestamp);

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
     * Met à jour une paire de timesheets (entrée + sortie) de manière atomique avec rollback
     * Gère l'ordre des mises à jour selon le sens du changement
     */
    async updateTimesheetPair(
        dto: TimesheetPairUpdateDTO,
        authUser: UserAuthDTO
    ): Promise<PaireTimeSheet> {

        const timeDiff = new Date(dto.entryTimestamp).getTime() - new Date(dto.exitTimestamp).getTime();
        if (timeDiff > 0) {
            throw new ValidationError("L'heure d'entrée doit être antérieure à l'heure de sortie");
        }

        // 2. Récupérer les deux timesheets
        const oldEntry : Timesheet | null = await this.R_timesheet.getTimesheetById(dto.entryId);
        const oldExit : Timesheet | null = await this.R_timesheet.getTimesheetById(dto.exitId);

        if (!oldEntry || !oldExit) {
            if(!oldEntry && !oldExit) {
                throw new NotFoundError("Paire de timesheets introuvable");
            } else if(!oldEntry) {
                throw new NotFoundError(`Timesheet ${dto.entryId} introuvable`);
            } else {
                throw new NotFoundError(`Timesheet ${dto.exitId} introuvable`);
            }
        }

        // 3. Vérifier les permissions
        await this.authorizationService.validateManagerOwnership(oldEntry.employeId, authUser);

        // 4. Convertir les timestamps
        const newEntryTime = new Timesheet_L1({
            id: oldEntry.id,
            employeId: oldEntry.employeId,
            timestamp: new Date(dto.entryTimestamp),
            clockin: true,
            status: 'normal',
            createdAt: oldEntry.createdAt,
            updatedAt: oldEntry.updatedAt
        });
        const newExitTime = new Timesheet_L1({
            id: oldExit.id,
            employeId: oldExit.employeId,
            timestamp: new Date(dto.exitTimestamp),
            clockin: false,
            status: 'normal',
            createdAt: oldExit.createdAt,
            updatedAt: oldExit.updatedAt
        });


        // 6. Validation de la paire
        const oldEntryTime = new Timesheet_L1({ ...oldEntry });
        const oldExitTime = new Timesheet_L1({ ...oldExit });

        await this.validationService.validateTimestampPositionPair(
            oldExit.employeId,
            oldEntryTime,
            oldExitTime,
            newEntryTime,
            newExitTime
        );


        // 7. Ordre d'update selon le sens avec gestion d'erreur
        return await  this.R_timesheet.updateTimesheetPair(newEntryTime, newExitTime);
    }
    /**
     * Met à jour un timesheet existant
     * - Employé ne peut PAS modifier un timesheet
     * - Admin/manager uniquement
     * - Manager ne peut modifier que les timesheets de ses employés
     */
    async updateTimesheet(id: number, dto: TimesheetUpdateDTO, authUser: UserAuthDTO): Promise<Timesheet_L1> {

        // 1. Récupérer le timesheet existant
        const existing = await this.R_timesheet.getTimesheetById(id);
        if (!existing) throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);

        // 2. Vérifier que le manager gère bien cet employé
        await this.authorizationService.validateManagerOwnership(existing.employeId, authUser);

        // 3. Convertir le DTO en Timesheet_L1
        const timeSheetEntityUpdate : Timesheet_L1 = TimesheetMapper.FromDTO.Update_ToEntity(existing, dto);

        // 4. Validation contextuelle du timestamp si modifié
        const oldTimesheet = new Timesheet_L1({ ...existing });

        await this.validationService.validateTimestampPosition(
            existing.employeId,
            oldTimesheet,
            timeSheetEntityUpdate
        );

        return await this.R_timesheet.updateTimesheet_ById(timeSheetEntityUpdate);
    }

    // #endregion

    // #region Delete

    /**
     * Supprime un timesheet (admin/manager uniquement)
     * - Manager ne peut supprimer que les timesheets de ses employés
     */
    async deleteTimesheet(id: number, authUser: UserAuthDTO): Promise<void> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);
        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Vérifier que le manager gère bien cet employé
        await this.authorizationService.validateManagerOwnership(timesheet.employeId, authUser);

        await this.R_timesheet.deleteTimesheet_ById(id);
    }

    // #endregion
}
