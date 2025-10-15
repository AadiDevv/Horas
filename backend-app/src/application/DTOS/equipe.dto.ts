// #region Nested DTOs (Types réutilisables)
/**
 * Format d'un manager pour les DTOs d'équipe
 * Utilisé dans EquipeReadDTO et EquipeWithMembresDTO
 */
export interface EquipeManagerDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: "admin" | "manager" | "employe";
}

/**
 * Format d'un membre (employé) pour les DTOs d'équipe
 * Utilisé dans EquipeWithMembresDTO
 */
export interface EquipeMembreDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: "admin" | "manager" | "employe";
    isActive: boolean;
    telephone?: string;
    plageHoraireId?: number;
}
// #endregion

// #region Create DTO
/**
 * DTO pour créer une équipe
 * Le managerId est fourni dans le body ou extrait du JWT selon les permissions
 */
export interface EquipeCreateDTO {
    nom: string;
    description?: string;
    managerId: number;
    plageHoraireId?: number;
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour une équipe
 * Tous les champs sont optionnels pour permettre des updates partiels (PATCH)
 */
export interface EquipeUpdateDTO {
    nom?: string;
    description?: string;
    managerId?: number;
    plageHoraireId?: number;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une équipe
 * Inclut les informations du manager et le nombre de membres
 */
export interface EquipeReadDTO {
    id: number;
    nom: string;
    description?: string;
    managerId: number;
    plageHoraireId?: number;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;

    // Informations enrichies pour le frontend
    manager?: EquipeManagerDTO;

    membresCount?: number; // Nombre de membres dans l'équipe
}

/**
 * DTO pour une équipe avec la liste complète des membres
 * Utilisé pour GET /equipes/:id avec include=membres
 */
export interface EquipeWithMembresDTO extends EquipeReadDTO {
    membres: EquipeMembreDTO[];
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des équipes (version simplifiée)
 */
export interface EquipeListItemDTO {
    id: number;
    nom: string;
    description?: string;
    managerId: number;
    plageHoraireId?: number;
    managerNom: string; // Nom complet du manager (prenom + nom)
    membresCount: number;
    createdAt: string;
}

/**
 * DTO pour filtrer les équipes (Query Params)
 * Utilisé dans GET /api/equipes?managerId=X
 * 
 * Logique métier :
 * - Manager : managerId optionnel (déduit du JWT si omis, vérifié si fourni)
 * - Admin : managerId optionnel (retourne toutes les équipes si omis)
 * - Employé : accès refusé
 */
export interface EquipeFilterDTO {
    managerId?: number; // ID du manager dont on veut voir les équipes
}
// #endregion

