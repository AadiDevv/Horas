// #region Create DTO
/**
 * DTO pour créer un schedule de travail
 * Les hours sont au format "HH:mm" (ex: "09:00", "17:30")
 * activeDays est un tableau de lastNamebres représentant les jours (1=Lundi, 7=Dimanche)
 */
export interface ScheduleCreateDTO {
    name: string;
    startHour: string; // Format: "HH:mm" ex: "09:00"
    endHour: string;   // Format: "HH:mm" ex: "17:30"
    activeDays: number[]; // Tableau de 1 à 7 (1=Lundi, 7=Dimanche)
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un schedule
 * Tous les champs sont optionnels (PATCH)
 */
export interface ScheduleUpdateDTO {
    name?: string;
    startHour?: string; // Format: "HH:mm"
    endHour?: string;   // Format: "HH:mm"
    activeDays?: number[];
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un schedule
 * Les hours sont retournées au format ISO 8601 ou "HH:mm" selon vos préférences
 */
export interface ScheduleReadDTO {
    id: number;
    name: string;
    startHour: string; // Format: "HH:mm" ou ISO
    endHour: string;   // Format: "HH:mm" ou ISO
    activeDays: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    createdAt: string;
    updatedAt: string;

    // Informations enrichies pour le frontend
    usersCount?: number; // nombre d'users avec cet schedule
}

/**
 * DTO pour un schedule avec la liste des users assignés
 * Utilisé pour GET /schedules/:id?include=users
 */
export interface ScheduleWithUsersDTO extends ScheduleReadDTO {
    users: {
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
    name: string;
    startHour: string;
    endHour: string;
    activeDays: number[];
    usersCount: number;
}
// #endregion

// #region Filter DTO
/**
 * DTO pour filtrer les schedules
 */
export interface ScheduleFilterDTO {
    name?: string;
    activeDays?: number[];
}
// #endregion

