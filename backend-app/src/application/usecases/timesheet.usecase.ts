import { TimesheetUpdateDTO, TimesheetFilterDTO, TimesheetStatsDTO } from "@/application/DTOS";
import { Timesheet } from "@/domain/entities/timesheet";
import { ITimesheet } from "@/domain/interfaces/timesheet.interface";
import { NotFoundError, ValidationError, ForbiddenError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des timesheets
 * Contient la logique métier et les règles de gestion
 */
export class TimesheetUseCase {

    constructor(private readonly R_timesheet: ITimesheet) { }

    // #region Read

    /**
     * Récupère les timesheets selon le rôle de l'utilisateur
     * 
     * Logique :
     * - Admin : peut filtrer tous les timesheets
     * - Manager : peut filtrer par employé de son équipe (logique à faire côté controller/middleware)
     * - Employé : ne peut voir que ses propres timesheets
     * 
     * @param userRole - Rôle de l'utilisateur
     * @param userId - ID de l'utilisateur connecté
     * @param filter - Filtres optionnels
     */
    async getTimesheets(userRole: string, userId: number, filter?: TimesheetFilterDTO): Promise<Timesheet[]> {
        let effectiveFilter: TimesheetFilterDTO = { ...filter };

        if (userRole !== "admin" && userRole !== "manager") {
            // L'employé ne peut voir que ses propres timesheets
            effectiveFilter.employeId = userId;
        }

        const timesheets = await this.R_timesheet.getAllTimesheets(effectiveFilter);
        return timesheets.map(t => new Timesheet({ ...t }));
    }

    /**
     * Récupère un timesheet par son ID
     */
    async getTimesheetById(id: number, userRole: string, userId: number): Promise<Timesheet> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);

        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        // Si employé, il ne peut consulter que ses propres timesheets
        if (userRole === "employe" && timesheet.employeId !== userId) {
            throw new ForbiddenError("Accès interdit à ce timesheet");
        }

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

        return await this.R_timesheet.getTimesheetStats(employeId, startDate, endDate);
    }

    // #endregion

    // #region Create

    /**
     * Crée un nouveau timesheet
     * @param timesheet - Entité Timesheet à sauvegarder
     */
    async createTimesheet(timesheet: Timesheet): Promise<Timesheet> {
        timesheet.validate();
        return await this.R_timesheet.createTimesheet(timesheet);
    }

    // #endregion

    // #region Update

    /**
     * Met à jour un timesheet existant
     * - Employé ne peut PAS modifier un timesheet
     * - Admin/manager uniquement
     */
    async updateTimesheet(id: number, dto: TimesheetUpdateDTO): Promise<Timesheet> {
        const existing = await this.R_timesheet.getTimesheetById(id);
        if (!existing) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        const updated = Timesheet.fromUpdateDTO(existing, dto);
        updated.validate();

        return await this.R_timesheet.updateTimesheet_ById(updated);
    }

    // #endregion

    // #region Delete

    /**
     * Supprime un timesheet (admin/manager uniquement)
     */
    async deleteTimesheet(id: number): Promise<void> {
        const timesheet = await this.R_timesheet.getTimesheetById(id);
        if (!timesheet) {
            throw new NotFoundError(`Timesheet avec l'ID ${id} introuvable`);
        }

        await this.R_timesheet.deleteTimesheet_ById(id);
    }

    // #endregion
}
