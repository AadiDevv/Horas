import { TimesheetStatus } from "@/domain/types";

// #region Update DTO
/**
 * DTO pour corriger un timesheet (admin/manager uniquement)
 */
export interface TimesheetUpdateDTO {
    date?: string;    // Format: "YYYY-MM-DD"
    hour?: string;   // Format: "HH:mm:ss" ou ISO DateTime
    clockin?: boolean;
    status?: TimesheetStatus;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un timesheet
 */
export interface TimesheetReadDTO {
    id: number;
    employeId: number;
    date: string;      // Format: "YYYY-MM-DD"
    hour: string;     // Format ISO DateTime complet
    clockin: boolean;
    status: TimesheetStatus;
    createdAt: string;
    updatedAt: string;

    // Informations enrichies pour le frontend
    employe?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les timesheets
 * Query params: GET /timesheets?employeId=1&dateDebut=2025-01-01&dateFin=2025-01-31
 */
export interface TimesheetFilterDTO {
    employeId?: number;
    dateDebut?: string; // Format: "YYYY-MM-DD"
    dateFin?: string;   // Format: "YYYY-MM-DD"
    status?: TimesheetStatus;
    clockin?: boolean;
}

/**
 * DTO pour la liste des timesheets (version simplifiée)
 */
export interface TimesheetListItemDTO {
    id: number;
    employeId: number;
    employelastName: string; // firstName + lastName
    date: string;
    hour: string;
    clockin: boolean;
    status: TimesheetStatus;
}
// #endregion

// #region Statistics DTO
/**
 * DTO pour les statistiques de timesheet d'un employé sur une période
 * Exemple: GET /timesheets/stats?employeId=1&dateDebut=...&dateFin=...
 */
export interface TimesheetStatsDTO {
    employeId: number;
    periodStart: string;
    periodEnd: string;
    totalTimesheets: number;
    totalEntrees: number;
    totalSorties: number;
    timesheetsNormaux: number;
    timesheetsRetard: number;
    timesheetsIncomplete: number;
    joursPointes: number; // lastNamebre de jours uniques
}
// #endregion

