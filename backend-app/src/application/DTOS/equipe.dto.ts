import { Role } from "@/domain/types";

// #region Create DTO
/**
 * DTO pour créer une équipe
 * Le managerId est fourni dans le body ou extrait du JWT selon les permissions
 */
export interface EquipeCreateDTO {
    nom: string;
    description?: string;
    managerId: number;
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
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;

    // Informations enrichies pour le frontend
    manager?: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
        role: Role;
    };

    membresCount?: number; // Nombre de membres dans l'équipe
}

/**
 * DTO pour une équipe avec la liste complète des membres
 * Utilisé pour GET /equipes/:id avec include=membres
 */
export interface EquipeWithMembresDTO extends EquipeReadDTO {
    membres: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
        role: Role;
        isActive: boolean;
        telephone: string | null;
    }[];
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des équipes (version simplifiée)
 */
export interface EquipeListItemDTO {
    id: number;
    nom: string;
    description: string | null;
    managerId: number;
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

