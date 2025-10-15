// #region Create DTO
/**
 * DTO pour créer un schedule de travail
 * Les heures sont au format "HH:mm" (ex: "09:00", "17:30")
 * joursActifs est un tableau de lastNamebres représentant les jours (1=Lundi, 7=Dimanche)
 */
export interface ScheduleCreateDTO {
    lastName: string;
    heureDebut: string; // Format: "HH:mm" ex: "09:00"
    heureFin: string;   // Format: "HH:mm" ex: "17:30"
    joursActifs: number[]; // Tableau de 1 à 7 (1=Lundi, 7=Dimanche)
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un schedule
 * Tous les champs sont optionnels (PATCH)
 */
export interface ScheduleUpdateDTO {
    lastName?: string;
    heureDebut?: string; // Format: "HH:mm"
    heureFin?: string;   // Format: "HH:mm"
    joursActifs?: number[];
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un schedule
 * Les heures sont retournées au format ISO 8601 ou "HH:mm" selon vos préférences
 */
export interface ScheduleReadDTO {
    id: number;
    lastName: string;
    heureDebut: string; // Format: "HH:mm" ou ISO
    heureFin: string;   // Format: "HH:mm" ou ISO
    joursActifs: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    createdAt: string;
    updatedAt: string;

    // Informations enrichies pour le frontend
    utilisateursCount?: number; // lastNamebre d'utilisateurs avec cet schedule
}

/**
 * DTO pour un schedule avec la liste des utilisateurs assignés
 * Utilisé pour GET /schedules/:id?include=utilisateurs
 */
export interface ScheduleWithUtilisateursDTO extends ScheduleReadDTO {
    utilisateurs: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    }[];
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des schedules (version simplifiée)
 */
export interface ScheduleListItemDTO {
    id: number;
    lastName: string;
    heureDebut: string;
    heureFin: string;
    joursActifs: number[];
    utilisateursCount: number;
}
// #endregion

