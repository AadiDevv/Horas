// #region Nested DTOs (Types réutilisables)
/**
 * Format d'un manager pour les DTOs d'équipe
 * Utilisé dans EquipeReadDTO et EquipeWithMembresDTO
 */
export interface EquipeManagerDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "manager" | "employe";
}

/**
 * Format d'un membre (employé) pour les DTOs d'équipe
 * Utilisé dans EquipeWithMembresDTO
 */
export interface EquipeMembreDTO {
    id: number;
    firstName: string;
    lastName: string;
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
    lastName: string;
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
    lastName?: string;
    description?: string;
    managerId?: number;
    plageHoraireId?: number;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une équipe
 * Inclut les informations du manager et le lastNamebre de membres
 */
export interface EquipeReadDTO {
    id: number;
    lastName: string;
    description?: string;
    managerId: number;
    plageHoraireId?: number;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;

    // Informations enrichies pour le frontend
    manager?: EquipeManagerDTO;

    membresCount?: number; // lastNamebre de membres dans l'équipe
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
    lastName: string;
    description?: string;
    managerId: number;
    plageHoraireId?: number;
    managerlastName: string; // lastName complet du manager (firstName + lastName)
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

