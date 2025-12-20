import { ExceptionType, ExceptionStatus } from "@/domain/types";
import {
    ExceptionProps,
    ExceptionProps_Core,
    ExceptionProps_L1,
} from "@/domain/types/entitiyProps";
import { UserReadEmployeeDTO_Core, UserReadManagerDTO_Core } from "./user.dto";
import { AuthContext } from "./timesheet.dto";

// #region Create DTO
/**
 * DTO pour créer une exception
 *
 * EMPLOYÉ :
 * - employeId = extrait du token
 * - status = 'en_attente' par défaut
 *
 * MANAGER/ADMIN :
 * - Peut créer pour n'importe quel employé
 * - Peut définir le statut directement
 */
export interface ExceptionCreateDTO {
    /** Type de l'exception */
    type: ExceptionType;
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
    status?: ExceptionStatus;
}
// #endregion

// #region Update DTO
/**
 * DTO pour modifier une exception (employé peut modifier sa propre exception en_attente)
 * Tous les champs sont optionnels (PATCH)
 */
export interface ExceptionUpdateDTO {
    type?: ExceptionType;
    startDateTime?: string;  // Format: ISO DateTime
    endDateTime?: string;    // Format: ISO DateTime
    isFullDay?: boolean;
    comments?: string;
}
// #endregion

// #region Validate DTO
/**
 * DTO pour valider/refuser une exception (manager uniquement)
 */
export interface ExceptionValidateDTO {
    /** Statut de validation (approuve ou refuse) */
    status: 'approuve' | 'refuse';
    /** Commentaires du manager (optionnels) */
    comments?: string;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une exception (GET /exceptions/:id)
 * Basé sur ExceptionProps avec transformations Date → string + relations
 */
export type ExceptionReadDTO = Omit<Omit<ExceptionProps,
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

export type ExceptionReadDTO_L1 = Omit<Omit<ExceptionReadDTO, 'employe' | 'validator'>, never>

export type ExceptionReadDTO_Core = Omit<Omit<ExceptionReadDTO_L1, 'createdAt' | 'updatedAt' | 'deletedAt'>, never>
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les exceptions
 * Query params: GET /exceptions?employeId=1&status=en_attente&type=conges_payes
 */
export interface ExceptionFilterDTO {
    employeId?: number;
    status?: ExceptionStatus;
    type?: ExceptionType;
    startDate?: string; // Format: "YYYY-MM-DD" - filtre sur startDateTime
    endDate?: string;   // Format: "YYYY-MM-DD" - filtre sur endDateTime
}

/**
 * DTO pour la liste des exceptions (version simplifiée)
 * Basé sur ExceptionProps_Core avec transformations Date → string
 */
export type ExceptionListItemDTO = Omit<Omit<ExceptionProps_Core,
    'startDateTime' | 'endDateTime' | 'validatedAt'> & {
    startDateTime: string;      // Date → string ISO DateTime
    endDateTime: string;        // Date → string ISO DateTime
    validatedAt: string | null; // Date → string ISO DateTime
}, never>
// #endregion
