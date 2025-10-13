import { PointageStatus } from "@/domain/types";

// #region Update DTO
/**
 * DTO pour corriger un pointage (admin/manager uniquement)
 */
export interface PointageUpdateDTO {
    date?: string;    // Format: "YYYY-MM-DD"
    heure?: string;   // Format: "HH:mm:ss" ou ISO DateTime
    clockin?: boolean;
    status?: PointageStatus;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un pointage
 */
export interface PointageReadDTO {
    id: number;
    employeId: number;
    date: string;      // Format: "YYYY-MM-DD"
    heure: string;     // Format ISO DateTime complet
    clockin: boolean;
    status: PointageStatus;
    createdAt: string;
    updatedAt: string;

    // Informations enrichies pour le frontend
    employe?: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
    };
}
// #endregion

// #region List & Filter DTOs
/**
 * DTO pour filtrer les pointages
 * Query params: GET /pointages?employeId=1&dateDebut=2025-01-01&dateFin=2025-01-31
 */
export interface PointageFilterDTO {
    employeId?: number;
    dateDebut?: string; // Format: "YYYY-MM-DD"
    dateFin?: string;   // Format: "YYYY-MM-DD"
    status?: PointageStatus;
    clockin?: boolean;
}

/**
 * DTO pour la liste des pointages (version simplifiée)
 */
export interface PointageListItemDTO {
    id: number;
    employeId: number;
    employeNom: string; // prenom + nom
    date: string;
    heure: string;
    clockin: boolean;
    status: PointageStatus;
}
// #endregion

// #region Statistics DTO
/**
 * DTO pour les statistiques de pointage d'un employé sur une période
 * Exemple: GET /pointages/stats?employeId=1&dateDebut=...&dateFin=...
 */
export interface PointageStatsDTO {
    employeId: number;
    periodeDebut: string;
    periodeFin: string;
    totalPointages: number;
    totalEntrees: number;
    totalSorties: number;
    pointagesNormaux: number;
    pointagesRetard: number;
    pointagesIncomplete: number;
    joursPointes: number; // Nombre de jours uniques
}
// #endregion

