import { Role } from "@/domain/types";
import {UserProps_Core, UserProps_L1} from "@/domain/types/entitiyProps"

// #region Authentication DTOs
/**
 * DTO pour l'inscription d'un utilisateur
 */
export interface UserRegisterDTO {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    teamId?: number;
    customScheduleId?: number;
    phone?: string;
}

/**
 * DTO pour la connexion
 */
export interface UserLoginDTO {
    email: string;
    password: string;
}

/**
 * Réponse d'authentification avec token JWT
 */
export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserAuthDTO;
    role: string;
}

/**
 * DTO utilisateur pour la réponse d'authentification (données minimales)
 */
export type UserAuthDTO = Omit<UserProps_L1, 'hashedPassword' | 'createdAt' | 'updatedAt' | 'deletedAt'>
// #endregion
