import { Role } from "@/domain/types";
// DTOs pour l'authentification
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

export interface UserLoginDTO {
    email: string;
    password: string;
}

export interface UserReadDTO {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    role: Role;
    isActive: boolean;
    telephone?: string | null;
    equipeId?: number | null;
    plageHoraireId?: number | null;
    createdAt: string;
    updatedAt: string | null;
    lastLoginAt: string | null;
    deletedAt: string | null;
}

export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserReadDTO;
    role: string;
}
