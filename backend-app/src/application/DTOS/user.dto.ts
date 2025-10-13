import { Role } from "@/domain/types";

// #region Create DTO (déjà existant dans auth.dto.ts)
/**
 * DTO pour créer un utilisateur
 * Utilisé lors de l'inscription ou de la création par un admin/manager
 */
export interface UserCreateDTO {
    prenom: string;
    nom: string;
    email: string;
    password: string;
    role: Role;
    equipeId?: number;
    plageHoraireId?: number;
    telephone?: string;
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un utilisateur
 * Tous les champs sont optionnels (PATCH)
 * Le mot de passe n'est pas inclus ici (route séparée pour changer le mot de passe)
 */
export interface UserUpdateDTO {
    prenom?: string;
    nom?: string;
    email?: string;
    telephone?: string;
    role?: Role;
    isActive?: boolean;
    equipeId?: number | null;
    plageHoraireId?: number | null;
}

/**
 * DTO pour changer le mot de passe
 * Route séparée: PATCH /users/:id/password
 */
export interface UserChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

/**
 * DTO pour réinitialiser le mot de passe (admin uniquement)
 */
export interface UserResetPasswordDTO {
    newPassword: string;
}
// #endregion

// #region Read DTO (déjà existant dans auth.dto.ts)
/**
 * DTO de retour pour un utilisateur
 * Le mot de passe haché n'est jamais retourné
 */
export interface UserReadDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: Role;
    isActive: boolean;
    telephone: string | null;
    equipeId: number | null;
    plageHoraireId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;

    // Informations enrichies (optionnelles selon le endpoint)
    equipe?: {
        id: number;
        nom: string;
    };

    horaire?: {
        id: number;
        nom: string;
        heureDebut: string;
        heureFin: string;
    };
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des utilisateurs (version simplifiée)
 */
export interface UserListItemDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: Role;
    isActive: boolean;
    equipeId: number | null;
    equipeNom: string | null;
}

/**
 * DTO pour filtrer les utilisateurs
 * Query params: GET /users?role=employe&equipeId=1&isActive=true
 */
export interface UserFilterDTO {
    role?: Role;
    equipeId?: number;
    isActive?: boolean;
    search?: string; // Recherche par nom, prénom ou email
}
// #endregion

// #region Login DTO (déjà existant dans auth.dto.ts)
export interface UserLoginDTO {
    email: string;
    password: string;
}

export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserReadDTO;
    role: string;
}
// #endregion

