// DTOs pour l'authentification
export interface UserCreateDTO {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
}

export interface UserLoginDTO {
    email: string;
    password: string;
}

export interface UserReadDTO {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    lastLoginAt: string | null;
    isAdmin: boolean;
}

export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserReadDTO;
    isAdmin: boolean;
}
