import { Role } from "@/domain/types";
import {
    UserEmployeeProps,
    UserManagerProps,
    UserEmployeeProps_Core,
    UserManagerProps_Core
} from "@/domain/types/entitiyProps";

// #region Create DTO
/**
 * DTO pour créer un utilisateur (via admin/manager)
 * Différent de UserRegisterDTO (auth.dto.ts) qui est pour l'auto-inscription
 */



export type UserCreateEmployeeDTO  = Omit<Omit<UserEmployeeProps_Core,'id'| 'hashedPassword' | 'role'> &{
        teamId?: number; // null if the employee is not assigned to a team
        customScheduleId?: number; 
},never>
export type UserCreateManagerDTO  = Omit<Omit<UserManagerProps_Core,'id'| 'hashedPassword' | 'role'> &{
    teamIds?: number[] ; 
    employeeIds?: number[];
},never>

// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour un utilisateur
 * Tous les champs sont optionnels (PATCH)
 * 
 * Restrictions métier :
 * - Seuls les champs de profil personnel sont autorisés
 * - Le mot de passe n'est pas inclus ici (route séparée pour changer le mot de passe)
 * - teamId et customScheduleId ne sont pas modifiables via ce DTO (routes dédiées)
 */
export interface UserUpdateDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
}

export interface UserAsignTeamDTO {
    teamId: number;
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
 * DTO de retour pour un employé (GET /users/:id pour role employe)
 * Basé sur UserEmployeeProps avec transformations Date → string
 */
export type UserReadEmployeeDTO = Omit<UserEmployeeProps, 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'deletedAt'> & {
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    deletedAt: string | null;
}

/**
 * DTO de retour pour un manager (GET /users/:id pour role manager)
 * Basé sur UserManagerProps avec transformations Date → string
 */
export type UserReadManagerDTO = Omit<UserManagerProps, 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'deletedAt'> & {
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    deletedAt: string | null;
}

// #endregion

// #region List DTO
/**
 * DTO pour la liste des users (version simplifiée)
 * Format léger pour performance - pas de relations complètes, juste IDs
 */
export type UserEmployeeListItemDTO =  UserEmployeeProps_Core[]
export type UserManagerListItemDTO =  UserManagerProps_Core[]
export type UserReadEmployeeCoreDTO = UserEmployeeProps_Core;
export type UserReadManagerCoreDTO = UserManagerProps_Core;
/**
 * DTO pour filtrer les users
 * Query params: GET /users?role=employe&teamId=1&isActive=true
 */
export interface UserFilterDTO {
    role?: Role;
    teamId?: number;
    isActive?: boolean;
    search?: string; // Recherche par nom, prénom ou email
}
// #endregion

