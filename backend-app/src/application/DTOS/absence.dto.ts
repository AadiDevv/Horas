import { AbsenceType, AbsenceStatus } from "@/domain/types";
import {
    AbsenceProps,
    AbsenceProps_Core,
    AbsenceProps_L1,
} from "@/domain/types/entitiyProps";
import { UserReadEmployeeDTO_Core, UserReadManagerDTO_Core } from "./user.dto";
import { AuthContext } from "./timesheet.dto";

// #region Create DTO
/**
 * DTO pour créer une absence
 *
 * EMPLOYÉ :
 * - employeId = extrait du token
 * - status = 'en_attente' par défaut
 *
 * MANAGER/ADMIN :
 * - Peut créer pour n'importe quel employé
 * - Peut définir le statut directement
 */
export interface AbsenceCreateDTO {
    /** Type de l'absence */
    type: AbsenceType;
    /** Date et heure de début */
    startDateTime: string;  // Format: ISO DateTime "2025-12-29T08:30:00.000Z"
    /** Date et heure de fin */
    endDateTime: string;    // Format: ISO DateTime "2025-12-29T17:30:00.000Z"
    /** Si true, les heures sont ignorées (journée complète) */
    isFullDay?: boolean;
    /** Commentaires optionnels */
    comments?: string;
    /** ID de l'employé (OBLIGATOIRE pour Manager/Admin, ignoré pour Employé) */
    employeId?: number;
    /** Statut (optionnel, par défaut 'en_attente') */
    status?: AbsenceStatus;
}
// #endregion

// #region Update DTO
/**
 * DTO pour modifier une absence (employé peut modifier sa propre absence en_attente)
 * Tous les champs sont optionnels (PATCH)
 */
export interface AbsenceUpdateDTO {
    type?: AbsenceType;
    startDateTime?: string;  // Format: ISO DateTime
    endDateTime?: string;    // Format: ISO DateTime
    isFullDay?: boolean;
    comments?: string;
}
// #endregion

// #region Validate DTO
/**
 * DTO pour valider/refuser une absence (manager uniquement)
 */
export interface AbsenceValidateDTO {
    /** Statut de validation (approuve ou refuse) */
    status: 'approuve' | 'refuse';
    /** Commentaires du manager (optionnels) */
    comments?: string;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une absence (GET /absences/:id)
 * Basé sur AbsenceProps avec transformations Date → string + relations
 */
export type AbsenceReadDTO = Omit<Omit<AbsenceProps,
    'startDateTime' | 'endDateTime' | 'validatedAt' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'employe' | 'validator'> & {
    startDateTime: string;      // Date → string ISO DateTime
    endDateTime: string;        // Date → string ISO DateTime
    validatedAt: string | null; // Date → string ISO DateTime
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    employe: UserReadEmployeeDTO_Core;
    validator: UserReadManagerDTO_Core | null;
}, never>

export type AbsenceReadDTO_L1 = Omit<Omit<AbsenceReadDTO, 'employe' | 'validator'>, never>

export type AbsenceReadDTO_Core = Omit<Omit<AbsenceReadDTO_L1, 'createdAt' | 'updatedAt' | 'deletedAt'>, never>
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les absences
 * Query params: GET /absences?employeId=1&status=en_attente&type=conges_payes
 */
export interface AbsenceFilterDTO {
    employeId?: number;
    status?: AbsenceStatus;
    type?: AbsenceType;
    startDate?: string; // Format: "YYYY-MM-DD" - filtre sur startDateTime
    endDate?: string;   // Format: "YYYY-MM-DD" - filtre sur endDateTime
}

/**
 * DTO pour la liste des absences (version simplifiée)
 * Basé sur AbsenceProps_Core avec transformations Date → string
 */
export type AbsenceListItemDTO = Omit<Omit<AbsenceProps_Core,
    'startDateTime' | 'endDateTime' | 'validatedAt'> & {
    startDateTime: string;      // Date → string ISO DateTime
    endDateTime: string;        // Date → string ISO DateTime
    validatedAt: string | null; // Date → string ISO DateTime
}, never>
// #endregion
