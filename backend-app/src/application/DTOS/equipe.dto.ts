// #region Nested DTOs (Types réutilisables)
/**
 * Format d'un manager pour les DTOs d'équipe
 * Utilisé dans TeamReadDTO et TeamWithMembresDTO
 */
export interface TeamManagerDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "manager" | "employe";
}

/**
 * Format d'un membre (employé) pour les DTOs d'équipe
 * Utilisé dans TeamWithMembresDTO
 */
export interface TeamMembreDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "manager" | "employe";
    isActive: boolean;
    phone?: string;
    scheduleId?: number;
}
// #endregion

// #region Create DTO
/**
 * DTO pour créer une équipe
 * Le managerId est fourni dans le body ou extrait du JWT selon les permissions
 */
export interface TeamCreateDTO {
    lastName: string;
    description?: string;
    managerId: number;
    scheduleId?: number;
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour une équipe
 * Tous les champs sont optionnels pour permettre des updates partiels (PATCH)
 */
export interface TeamUpdateDTO {
    lastName?: string;
    description?: string;
    managerId?: number;
    scheduleId?: number;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une équipe
 * Inclut les informations du manager et le lastNamebre de membres
 */
export interface TeamReadDTO {
    id: number;
    lastName: string;
    description?: string;
    managerId: number;
    scheduleId?: number;
    createdAt: string;
    updatedAt?: string;
    deletedAt?: string;

    // Informations enrichies pour le frontend
    manager?: TeamManagerDTO;

    membresCount?: number; // lastNamebre de membres dans l'équipe
}

/**
 * DTO pour une équipe avec la liste complète des membres
 * Utilisé pour GET /teams/:id avec include=membres
 */
export interface TeamWithMembresDTO extends TeamReadDTO {
    membres: TeamMembreDTO[];
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des équipes (version simplifiée)
 */
export interface TeamListItemDTO {
    id: number;
    lastName: string;
    description?: string;
    managerId: number;
    scheduleId?: number;
    managerlastName: string; // lastName complet du manager (firstName + lastName)
    membresCount: number;
    createdAt: string;
}

/**
 * DTO pour filtrer les équipes (Query Params)
 * Utilisé dans GET /api/teams?managerId=X
 * 
 * Logique métier :
 * - Manager : managerId optionnel (déduit du JWT si omis, vérifié si fourni)
 * - Admin : managerId optionnel (retourne toutes les équipes si omis)
 * - Employé : accès refusé
 */
export interface TeamFilterDTO {
    managerId?: number; // ID du manager dont on veut voir les équipes
}
// #endregion

