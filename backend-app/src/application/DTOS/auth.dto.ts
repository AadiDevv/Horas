import { Role } from "@/domain/types";

// #region Authentication DTOs
/**
 * DTO pour l'inscription d'un utilisateur
 */
export interface UserRegisterDTO {
    prenom: string;
    nom: string;
    email: string;
    password: string;
    role: Role;
    equipeId?: number;
    horaireId?: number;
    telephone?: string;
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
export interface UserAuthDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: Role;
    isActive: boolean;
    telephone?: string;
    equipeId?: number;
    horaireId?: number;
    createdAt: string;
    updatedAt?: string;
    lastLoginAt?: string;
    deletedAt?: string;
}
// #endregion
