// #region Create DTO
/**
 * DTO pour créer un horaire de travail
 * Les heures sont au format "HH:mm" (ex: "09:00", "17:30")
 * joursActifs est un tableau de nombres représentant les jours (1=Lundi, 7=Dimanche)
 */
export interface HoraireCreateDTO {
    nom: string;
    heureDebut: string; // Format: "HH:mm" ex: "09:00"
    heureFin: string;   // Format: "HH:mm" ex: "17:30"
    joursActifs: number[]; // Tableau de 1 à 7 (1=Lundi, 7=Dimanche)
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un horaire
 * Tous les champs sont optionnels (PATCH)
 */
export interface HoraireUpdateDTO {
    nom?: string;
    heureDebut?: string; // Format: "HH:mm"
    heureFin?: string;   // Format: "HH:mm"
    joursActifs?: number[];
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour un horaire
 * Les heures sont retournées au format ISO 8601 ou "HH:mm" selon vos préférences
 */
export interface HoraireReadDTO {
    id: number;
    nom: string;
    heureDebut: string; // Format: "HH:mm" ou ISO
    heureFin: string;   // Format: "HH:mm" ou ISO
    joursActifs: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    createdAt: string;
    updatedAt: string;

    // Informations enrichies pour le frontend
    utilisateursCount?: number; // Nombre d'utilisateurs avec cet horaire
}

/**
 * DTO pour un horaire avec la liste des utilisateurs assignés
 * Utilisé pour GET /horaires/:id?include=utilisateurs
 */
export interface HoraireWithUtilisateursDTO extends HoraireReadDTO {
    utilisateurs: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
        role: string;
    }[];
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des horaires (version simplifiée)
 */
export interface HoraireListItemDTO {
    id: number;
    nom: string;
    heureDebut: string;
    heureFin: string;
    joursActifs: number[];
    utilisateursCount: number;
}
// #endregion

