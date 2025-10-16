/**
 * 🎯 TYPES TYPESCRIPT POUR L'ÉQUIPE FRONTEND
 * 
 * Ce fichier contient tous les types nécessaires pour consommer l'API Horas.
 * Copiez ce fichier dans votre projet frontend (ex: src/types/api.ts)
 * 
 * Date: 12 Octobre 2025
 * Version: 1.0.0
 */

// =========================================
// TYPES DE BASE
// =========================================

export type Role = 'admin' | 'manager' | 'employe';
export type PointageStatus = 'normal' | 'retard' | 'absence' | 'incomplet';

// =========================================
// RÉPONSES STANDARD
// =========================================

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    message: string;
    timestamp: string;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    code: string;
    timestamp: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =========================================
// 1. USER / AUTHENTICATION
// =========================================

// #region User DTOs

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

export interface UserChangePasswordDTO {
    oldPassword: string;
    newPassword: string;
}

export interface UserResetPasswordDTO {
    newPassword: string;
}

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

export interface UserFilterDTO {
    role?: Role;
    equipeId?: number;
    isActive?: boolean;
    search?: string;
}

export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserReadDTO;
    role: string;
}

// #endregion

// =========================================
// 2. ÉQUIPE
// =========================================

// #region Equipe DTOs

export interface EquipeCreateDTO {
    nom: string;
    description?: string;
    managerId: number;
}

export interface EquipeUpdateDTO {
    nom?: string;
    description?: string;
    managerId?: number;
}

export interface EquipeReadDTO {
    id: number;
    nom: string;
    description: string | null;
    managerId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    manager?: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
        role: Role;
    };
    membresCount?: number;
}

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

export interface EquipeListItemDTO {
    id: number;
    nom: string;
    description: string | null;
    managerId: number;
    managerNom: string;
    membresCount: number;
    createdAt: string;
}

// #endregion

// =========================================
// 3. HORAIRE
// =========================================

// #region Horaire DTOs

export interface HoraireCreateDTO {
    nom: string;
    heureDebut: string; // Format: "HH:mm"
    heureFin: string;   // Format: "HH:mm"
    joursActifs: number[]; // 1=Lundi, 7=Dimanche
}

export interface HoraireUpdateDTO {
    nom?: string;
    heureDebut?: string;
    heureFin?: string;
    joursActifs?: number[];
}

export interface HoraireReadDTO {
    id: number;
    nom: string;
    heureDebut: string;
    heureFin: string;
    joursActifs: number[];
    createdAt: string;
    updatedAt: string;
    utilisateursCount?: number;
}

export interface HoraireWithUtilisateursDTO extends HoraireReadDTO {
    utilisateurs: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
        role: string;
    }[];
}

export interface HoraireListItemDTO {
    id: number;
    nom: string;
    heureDebut: string;
    heureFin: string;
    joursActifs: number[];
    utilisateursCount: number;
}

// #endregion

// =========================================
// 4. POINTAGE
// =========================================

// #region Pointage DTOs

export interface PointageCreateDTO {
    employeId: number;
    date: string;      // Format: "YYYY-MM-DD"
    heure: string;     // Format: "HH:mm:ss"
    clockin: boolean;  // true = entrée, false = sortie
    status?: PointageStatus;
}

export interface PointageQuickDTO {
    clockin: boolean;
}

export interface PointageUpdateDTO {
    date?: string;
    heure?: string;
    clockin?: boolean;
    status?: PointageStatus;
}

export interface PointageReadDTO {
    id: number;
    employeId: number;
    date: string;
    heure: string;
    clockin: boolean;
    status: PointageStatus;
    createdAt: string;
    updatedAt: string;
    employe?: {
        id: number;
        prenom: string;
        nom: string;
        email: string;
    };
}

export interface PointageListItemDTO {
    id: number;
    employeId: number;
    employeNom: string;
    date: string;
    heure: string;
    clockin: boolean;
    status: PointageStatus;
}

export interface PointageFilterDTO {
    employeId?: number;
    startDate?: string;
    endDate?: string;
    status?: PointageStatus;
    clockin?: boolean;
}

export interface PointageStatsDTO {
    employeId: number;
    periodeDebut: string;
    periodeFin: string;
    totalPointages: number;
    totalClockins: number;
    totalClockouts: number;
    pointagesNormaux: number;
    pointagesRetard: number;
    pointagesIncomplete: number;
    clockedDays: number;
}

// #endregion

// =========================================
// HELPER TYPES POUR AXIOS
// =========================================

/**
 * Type helper pour les réponses Axios
 * Usage: AxiosResponse<ApiData<UserReadDTO>>
 */
export type ApiData<T> = ApiSuccessResponse<T>['data'];

/**
 * Type guards pour vérifier le succès d'une réponse
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
}

export function isApiError(response: ApiResponse<any>): response is ApiErrorResponse {
    return response.success === false;
}

// =========================================
// EXEMPLE D'UTILISATION DANS LE FRONTEND
// =========================================

/**
 * EXEMPLE AVEC AXIOS
 * 
 * import axios from 'axios';
 * import type { ApiSuccessResponse, UserLoginDTO, TokenResponse } from '@/types/api';
 * 
 * async function login(credentials: UserLoginDTO) {
 *   const response = await axios.post<ApiSuccessResponse<TokenResponse>>(
 *     '/api/users/login',
 *     credentials
 *   );
 *   return response.data.data; // TypeScript sait que c'est un TokenResponse
 * }
 */

/**
 * EXEMPLE AVEC FETCH
 * 
 * import type { ApiSuccessResponse, EquipeListItemDTO } from '@/types/api';
 * 
 * async function getEquipes(): Promise<EquipeListItemDTO[]> {
 *   const response = await fetch('/api/equipes');
 *   const json = await response.json() as ApiSuccessResponse<EquipeListItemDTO[]>;
 *   return json.data;
 * }
 */

/**
 * EXEMPLE AVEC REACT QUERY
 * 
 * import { useQuery } from '@tanstack/react-query';
 * import type { ApiSuccessResponse, HoraireListItemDTO } from '@/types/api';
 * 
 * function useHoraires() {
 *   return useQuery({
 *     queryKey: ['horaires'],
 *     queryFn: async () => {
 *       const response = await fetch('/api/horaires');
 *       const json = await response.json() as ApiSuccessResponse<HoraireListItemDTO[]>;
 *       return json.data;
 *     }
 *   });
 * }
 */

