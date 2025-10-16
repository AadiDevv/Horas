import { Timesheet } from "@/domain/entities/timesheet";
import { TimesheetFilterDTO } from "@/application/DTOS";

/**
 * Interface du repository Timesheet
 * Définit le contrat pour les opérations CRUD sur les pointages
 */
export interface ITimesheet {
    // #region Read

    /**
     * Récupère tous les timesheets, éventuellement filtrés (par employeId, période, etc.)
     * @param filter - Filtres optionnels (employeId, startDate, endDate, status, clockin)
     */
    getAllTimesheets(filter?: TimesheetFilterDTO): Promise<Timesheet[]>;

    /**
     * Récupère un timesheet par son ID
     */
    getTimesheet_ById(id: number): Promise<Timesheet | null>;

    /**
     * Récupère tous les timesheets d'un employé
     * @param employeId - ID de l'employé
     */
    getTimesheets_ByEmployeId(employeId: number): Promise<Timesheet[]>;

    // #endregion

    // #region Create

    /**
     * Crée un nouveau timesheet
     */
    createTimesheet(timesheet: Timesheet): Promise<Timesheet>;

    // #endregion

    // #region Update

    /**
     * Met à jour un timesheet
     */
    updateTimesheet_ById(timesheet: Timesheet): Promise<Timesheet>;

    // #endregion

    // #region Delete

    /**
     * Supprime un timesheet par son ID (hard delete ou soft delete selon ta stratégie)
     */
    deleteTimesheet_ById(id: number): Promise<void>;

    // #endregion

    // #region Stats (optionnel)

    /**
     * Récupère les statistiques de présence pour un employé donné sur une période
     */
    getTimesheetStats(employeId: number, startDate: string, endDate: string): Promise<import("@/application/DTOS").TimesheetStatsDTO>;

    // #endregion
}
