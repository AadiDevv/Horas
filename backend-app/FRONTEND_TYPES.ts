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
export type TimesheetStatus = 'normal' | 'delay' | 'absence' | 'incomplet';

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
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    teamId?: number;
    customScheduleId?: number;
    phone?: string;
}

export interface UserLoginDTO {
    email: string;
    password: string;
}

export interface UserUpdateDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
    teamId?: number | null;
    customScheduleId?: number | null;
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
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    phone: string | null;
    teamId: number | null;
    customScheduleId: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    team?: {
        id: number;
        lastName: string;
    };
    customSchedule?: {
        id: number;
        lastName: string;
        startHour: string;
        endHour: string;
    };
}

export interface UserListItemDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    isActive: boolean;
    teamId: number | null;
    teamlastName: string | null;
}

export interface UserFilterDTO {
    role?: Role;
    teamId?: number;
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

// #region Team DTOs

export interface TeamCreateDTO {
    lastName: string;
    description?: string;
    managerId: number;
}

export interface TeamUpdateDTO {
    lastName?: string;
    description?: string;
    managerId?: number;
}

export interface TeamReadDTO {
    id: number;
    lastName: string;
    description: string | null;
    managerId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    manager?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
    };
    membersCount?: number;
}

export interface TeamWithMembersDTO extends TeamReadDTO {
    members: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
        isActive: boolean;
        phone: string | null;
    }[];
}

export interface TeamListItemDTO {
    id: number;
    lastName: string;
    description: string | null;
    managerId: number;
    managerlastName: string;
    membersCount: number;
    createdAt: string;
}

// #endregion

// =========================================
// 3. SCHEDULE
// =========================================

// #region Schedule DTOs

export interface ScheduleCreateDTO {
    lastName: string;
    startHour: string; // Format: "HH:mm"
    endHour: string;   // Format: "HH:mm"
    activeDays: number[]; // 1=Lundi, 7=Dimanche
}

export interface ScheduleUpdateDTO {
    lastName?: string;
    startHour?: string;
    endHour?: string;
    activeDays?: number[];
}

export interface ScheduleReadDTO {
    id: number;
    lastName: string;
    startHour: string;
    endHour: string;
    activeDays: number[];
    createdAt: string;
    updatedAt: string;
    usersCount?: number;
}

export interface ScheduleWithUsersDTO extends ScheduleReadDTO {
    users: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    }[];
}

export interface ScheduleListItemDTO {
    id: number;
    lastName: string;
    startHour: string;
    endHour: string;
    activeDays: number[];
    usersCount: number;
}

// #endregion

// =========================================
// 4. TIMESHEET
// =========================================

// #region Timesheet DTOs

export interface TimesheetCreateDTO {
    timestamp?: string; // Format: ISO DateTime "2025-12-13T08:30:00.000Z" (optionnel)
    status?: TimesheetStatus;
    employeId?: number; // Optionnel (OBLIGATOIRE pour Manager/Admin, interdit pour Employé)
}

export interface TimesheetQuickDTO {
    clockin: boolean;
}

export interface TimesheetUpdateDTO {
    timestamp?: string; // Format: ISO DateTime
    clockin?: boolean;
    status?: TimesheetStatus;
}

export interface TimesheetReadDTO {
    id: number;
    employeId: number;
    timestamp: string; // Format: ISO DateTime "2025-12-13T08:30:00.000Z"
    clockin: boolean;
    status: TimesheetStatus;
    createdAt: string;
    updatedAt: string;
    employe?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface TimesheetListItemDTO {
    id: number;
    employeId: number;
    employelastName: string;
    timestamp: string; // Format: ISO DateTime
    clockin: boolean;
    status: TimesheetStatus;
}

export interface TimesheetFilterDTO {
    employeId?: number;
    startDate?: string;  // Format: "YYYY-MM-DD" (pour filtrer par timestamp)
    endDate?: string;    // Format: "YYYY-MM-DD" (pour filtrer par timestamp)
    status?: TimesheetStatus;
    clockin?: boolean;
}

export interface TimesheetStatsDTO {
    employeId: number;
    periodStart: string;
    periodEnd: string;
    totalTimesheets: number;
    totalClockins: number;
    totalClockouts: number;
    timesheetsNormal: number;
    timesheetsDelay: number;
    timesheetsIncomplete: number;
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
 * import type { ApiSuccessResponse, TeamListItemDTO } from '@/types/api';
 * 
 * async function getTeams(): Promise<TeamListItemDTO[]> {
 *   const response = await fetch('/api/teams');
 *   const json = await response.json() as ApiSuccessResponse<TeamListItemDTO[]>;
 *   return json.data;
 * }
 */

/**
 * EXEMPLE AVEC REACT QUERY
 * 
 * import { useQuery } from '@tanstack/react-query';
 * import type { ApiSuccessResponse, ScheduleListItemDTO } from '@/types/api';
 * 
 * function useSchedules() {
 *   return useQuery({
 *     queryKey: ['schedules'],
 *     queryFn: async () => {
 *       const response = await fetch('/api/schedules');
 *       const json = await response.json() as ApiSuccessResponse<ScheduleListItemDTO[]>;
 *       return json.data;
 *     }
 *   });
 * }
 */

