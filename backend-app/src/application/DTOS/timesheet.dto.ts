import { TimesheetStatus } from "@/domain/types";
import {
    TimesheetProps,
    TimesheetProps_Core,
} from "@/domain/types/entitiyProps";
import { UserReadEmployeeDTO_Core, UserReadEmployeeDTO } from "./user.dto";

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
 * 
 * EMPLOYÉ :
 * - Payload vide ou juste { status?: ... }
 * - employeId = extrait du token
 * - timestamp = temps réel (auto)
 * - clockin = auto-déterminé (inverse du dernier)
 * 
 * MANAGER/ADMIN :
 * - employeId OBLIGATOIRE
 * - timestamp OPTIONNEL (si absent = temps réel, si fourni = doit être après le dernier)
 * - clockin = auto-déterminé (inverse du dernier)
 */
export interface TimesheetCreateDTO {
    /** 
     * Timestamp du pointage (optionnel)
     * - Employé : généré automatiquement (temps réel)
     * - Manager/Admin : peut spécifier un timestamp personnalisé (correction)
     *   MAIS il doit être postérieur au dernier timesheet existant
     */
    timestamp?: string;  // Format: ISO DateTime "2025-12-29T08:30:00.000Z"
    status?: TimesheetStatus;
    /** ID de l'employé cible (OBLIGATOIRE pour Manager/Admin, ignoré pour Employé) */
    employeId?: number;
}
// #endregion

// #region Update DTO
/**
 * DTO pour corriger un timesheet (admin/manager uniquement)
 * Tous les champs sont optionnels (PATCH) pour flexibilité
 */
export interface TimesheetUpdateDTO {
    timestamp?: string;  // Format: ISO DateTime
    clockin?: boolean;
    status?: TimesheetStatus;
}

/**
 * DTO pour mettre à jour une paire de timesheets (entrée + sortie) de manière atomique
 * Utilisé par PATCH /api/timesheets/pair
 */
export interface TimesheetPairUpdateDTO {
    entryId: number;
    exitId: number;
    entryTimestamp: string;  // ISO DateTime
    exitTimestamp: string;   // ISO DateTime
    status?: TimesheetStatus;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un timesheet (GET /timesheets/:id)
 * Basé sur TimesheetProps_L1 avec transformations Date → string + relation employe
 *
 * Note: Omit<Omit<...>, never> aplatit le type pour IntelliSense (affiche toutes les props au hover)
 */
export type TimesheetReadDTO = Omit<Omit<TimesheetProps, 'timestamp' | 'createdAt' | 'updatedAt'|'employe'> & {
    timestamp: string;  // Date → string ISO DateTime
    createdAt: string;
    updatedAt: string;
    employe: UserReadEmployeeDTO_Core;
}, never>

export type TimesheetReadDTO_L1 = Omit<Omit<TimesheetReadDTO, 'employe'>, never>

export type TimesheetReadDTO_Core = Omit<Omit<TimesheetReadDTO_L1, 'createdAt' | 'updatedAt'>, never>
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les timesheets
 * Query params: GET /timesheets?employeId=1&startDate=2025-01-01&endDate=2025-01-31
 */
export interface TimesheetFilterDTO {
    employeId?: number;
    startDate?: string; // Format: "YYYY-MM-DD" - filtre sur timestamp
    endDate?: string;   // Format: "YYYY-MM-DD" - filtre sur timestamp
    status?: TimesheetStatus;
    clockin?: boolean;
}

/**
 * DTO pour la liste des timesheets (version simplifiée)
 * Basé sur TimesheetProps_Core avec transformations Date → string
 */
export type TimesheetListItemDTO = Omit<Omit<TimesheetProps_Core, 'timestamp'> & {
    timestamp: string;  // Date → string ISO DateTime
}, never>
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
