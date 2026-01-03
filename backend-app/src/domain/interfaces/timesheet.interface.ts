import { Timesheet, Timesheet_Core, Timesheet_L1 } from "@/domain/entities/timesheet";
import { TimesheetFilterDTO, TimesheetStatsDTO } from "@/application/DTOS";
import { AdjacentTimeSheet } from "@/application/types/adjacentTimeSheets";

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
    getAllTimesheets(filter?: TimesheetFilterDTO): Promise<Timesheet_Core[]>;

    /**
     * Récupère un timesheet par son ID
     */
    getTimesheetById(id: number): Promise<Timesheet | null>;

    /**
     * Récupère tous les timesheets d'un employé
     * @param employeId - ID de l'employé
     */
    getTimesheets_ByEmployeId(employeId: number): Promise<Timesheet[]>;

    /**
     * Récupère tous le dernier timesheet d'un employé
     * @param employeId - ID de l'employé
     */
    getLastByEmployee(employeId: number): Promise<Timesheet | null>;

    /**
     * Récupère les timesheets adjacents (précédent et suivant) d'un employé
     * par rapport à un timestamp cible
     * @param employeId - ID de l'employé
     * @param targetTimestamp - Timestamp de référence
     * @param excludeIds - IDs à exclure (timesheets en cours de modification)
     */
    getAdjacentTimesheets(
        employeId: number,
        targetTimestamp: Timesheet_L1,
        excludeIds?: number[]
    ): Promise<AdjacentTimeSheet>;

    // #endregion

    // #region Create

    /**
     * Crée un nouveau timesheet
     * @param timesheet - Timesheet_Core (avant insertion, sans id ni jointures)
     * @returns Timesheet complet (après insertion, avec id et jointure employe)
     */
    createTimesheet(timesheet: Timesheet_Core): Promise<Timesheet_Core>;

    // #endregion

    // #region Update

    /**
     * Met à jour un timesheet
     */
    updateTimesheet_ById(timesheet: Timesheet_L1): Promise<Timesheet_L1>;

    /**
     * Met à jour une paire de timesheets (entrée + sortie) de manière atomique
     * @param entryId - ID du timesheet d'entrée
     * @param exitId - ID du timesheet de sortie
     * @param entryData - Données à mettre à jour pour l'entrée
     * @param exitData - Données à mettre à jour pour la sortie
     */
    updateTimesheetPair(
        entryData: Timesheet_L1,
        exitData: Timesheet_L1
    ): Promise<{ entry: Timesheet_L1; exit: Timesheet_L1 }>;

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
    getTimesheetStats(employeId: number, startDate: string, endDate: string): Promise<TimesheetStatsDTO>;

    // #endregion
}
