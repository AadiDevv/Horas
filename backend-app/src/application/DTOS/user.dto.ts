import { Role } from "@/domain/types";

// #region Create DTO
/**
 * DTO pour créer un utilisateur (via admin/manager)
 * Différent de UserRegisterDTO (auth.dto.ts) qui est pour l'auto-inscription
 */
export interface UserCreateDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    teamId?: number;
    scheduleId?: number;
    phone?: string;
}
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un utilisateur
 * Tous les champs sont optionnels (PATCH)
 * Le mot de passe n'est pas inclus ici (route séparée pour changer le mot de passe)
 */
export interface UserUpdateDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
    teamId?: number;
    scheduleId?: number;
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

// #region Read DTO
/**
 * DTO de retour pour un utilisateur (complet)
 * Le mot de passe haché n'est jamais retourné
 */
export interface UserReadDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    phone?: string;
    createdAt: string;
    updatedAt?: string;
    lastLoginAt?: string;
    deletedAt?: string;

    // Informations enrichies (optionnelles selon le endpoint)
    team?: {
        id: number;
        name?: string;
    };

    schedule?: {
        id: number;
        name?: string;
        startHour?: Date;
        endHour?: Date;
    };
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des users (version simplifiée)
 */
export interface UserListItemDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    teamId?: number;
    teamlastName?: string;
}

/**
 * DTO pour filtrer les users
 * Query params: GET /users?role=employe&teamId=1&isActive=true
 */
export interface UserFilterDTO {
    role?: Role;
    teamId?: number;
    isActive?: boolean;
    search?: string; // Recherche par lastName, prélastName ou email
}
// #endregion

