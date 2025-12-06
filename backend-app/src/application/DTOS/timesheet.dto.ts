import { TimesheetStatus } from "@/domain/types";
import {
    TimesheetProps,
    TimesheetProps_Core,
    TimesheetProps_L1,
    UserEmployeeProps_Core
} from "@/domain/types/entitiyProps";
import { UserReadEmployeeCoreDTO, UserReadEmployeeDTO } from "./user.dto";

// #region Common Types
/**
 * Contexte d'authentification de l'utilisateur
 * Extrait du JWT par le middleware d'auth dans les controllers
 */
export interface AuthContext {
    /** ID de l'utilisateur authentifié (qui fait la requête) */
    userId: number;
    /** Rôle de l'utilisateur authentifié */
    userRole: string;
}
// #endregion

// #region Create DTO
/**
 * DTO pour créer un timesheet
 * Données métier uniquement (pas d'auth - fournie séparément via AuthContext)
 */
export interface TimesheetCreateDTO {
    date: Date;
    hour: Date;
    status?: TimesheetStatus;
    clockin?: boolean;
    /** ID de l'employé cible (optionnel - si absent, = userId de l'AuthContext) */
    employeId?: number;
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
export type TimesheetReadDTO = Omit<Omit<TimesheetProps, 'date' | 'hour' | 'createdAt' | 'updatedAt'|'employe'> & {
    date: string;      // Date → string "YYYY-MM-DD"
    hour: string;      // Date → string ISO DateTime
    createdAt: string;
    updatedAt: string;
    employe: UserReadEmployeeCoreDTO;
},never>

export type TimesheetReadDTO_L1 = Omit<Omit<TimesheetReadDTO, 'employe'> ,never>

export type TimesheetReadDTO_Core = Omit<Omit<TimesheetReadDTO_L1, 'createdAt' | 'updatedAt'> ,never>
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
export type TimesheetListItemDTO = Omit<Omit<TimesheetProps_Core, 'date' | 'hour'> & {
    date: string;      // Date → string "YYYY-MM-DD"
    hour: string;      // Date → string ISO DateTime
},never>
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
