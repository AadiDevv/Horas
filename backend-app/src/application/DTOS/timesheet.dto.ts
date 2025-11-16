import { TimesheetStatus } from "@/domain/types";
import {
    TimesheetProps,
    TimesheetProps_Core,
    TimesheetProps_L1,
    UserEmployeeProps_Core
} from "@/domain/types/entitiyProps";

// #region Create Params
/**
 * Paramètres pour la création d'un timesheet
 * Utilisé par le usecase pour encapsuler tous les paramètres de création
 * Centralise le type pour éviter la propagation manuelle
 */
export interface TimesheetCreateParams {
    date: Date;
    hour: Date;
    status?: TimesheetStatus;
    clockin?: boolean;
    employeId?: number;
    userRole: string;
    userId: number;
}
// #endregion

// #region Update DTO
/**
 * DTO pour corriger un timesheet (admin/manager uniquement)
 * Tous les champs sont optionnels (PATCH) pour flexibilité
 */
export interface TimesheetUpdateDTO {
    date?: Date;    // Format: "YYYY-MM-DD"
    hour?: Date;   // Format: "HH:mm:ss" ou ISO DateTime
    clockin?: boolean;
    status?: TimesheetStatus;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un timesheet (GET /timesheets/:id)
 * Basé sur TimesheetProps_L1 avec transformations Date → string + relation employe
 */
export type TimesheetReadDTO = Omit<TimesheetProps, 'date' | 'hour' | 'createdAt' | 'updatedAt'> & {
    date: string;      // Date → string "YYYY-MM-DD"
    hour: string;      // Date → string ISO DateTime
    createdAt: string;
    updatedAt: string;
    employe: UserEmployeeProps_Core;
}
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les timesheets
 * Query params: GET /timesheets?employeId=1&startDate=2025-01-01&endDate=2025-01-31
 */
export interface TimesheetFilterDTO {
    employeId?: number;
    startDate?: string; // Format: "YYYY-MM-DD"
    endDate?: string;   // Format: "YYYY-MM-DD"
    status?: TimesheetStatus;
    clockin?: boolean;
}

/**
 * DTO pour la liste des timesheets (version simplifiée)
 * Basé sur TimesheetProps_Core avec transformations Date → string + employeeName dénormalisé
 */
export type TimesheetListItemDTO = Omit<TimesheetProps_Core, 'date' | 'hour'> & {
    date: string;      // Date → string "YYYY-MM-DD"
    hour: string;      // Date → string ISO DateTime
    employeeName: string;  // Dénormalisé (firstName + lastName)
}
// #endregion

// #region Statistics DTO
/**
 * DTO pour les statistiques de timesheet d'un employé sur une période
 * Exemple: GET /timesheets/stats?employeId=1&startDate=...&endDate=...
 */
export interface TimesheetStatsDTO {
    employeId: number;
    periodStart: string;
    periodEnd: string;
    totalTimesheets: number;
    totalClockins: number;
    totalClockouts: number;
    timesheetsNormal: number;
    timesheetsDelay: number;
    timesheetsIncomplete: number;
    clockedDays: number; // Nombre de jours uniques
}
// #endregion
