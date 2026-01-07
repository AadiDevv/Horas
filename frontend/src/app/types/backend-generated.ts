

export type Role = 'admin' | 'manager' | 'employe';
export type PointageStatus = 'normal' | 'retard' | 'absence' | 'incomplet';

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

export interface HoraireCreateDTO {
    nom: string;
    heureDebut: string;
    heureFin: string;
    joursActifs: number[];
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

export interface TimesheetCreateDTO {
    employeId: number;
    timestamp: string;
    status?: PointageStatus;
}

export interface TimesheetUpdateDTO {
    timestamp?: string;
    clockin?: boolean;
    status?: PointageStatus;
}

export interface TimesheetReadDTO {
    id: number;
    employeId: number;
    timestamp: string;
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

export interface TimesheetListItemDTO {
    id: number;
    employeId: number;
    employeNom: string;
    timestamp: string;
    clockin: boolean;
    status: PointageStatus;
}

export type PointageCreateDTO = TimesheetCreateDTO;

export type PointageUpdateDTO = TimesheetUpdateDTO;

export type PointageReadDTO = TimesheetReadDTO;

export type PointageListItemDTO = TimesheetListItemDTO;

export interface TimesheetFilterDTO {
    employeId?: number;
    startDate?: string;
    endDate?: string;
    status?: PointageStatus;
    clockin?: boolean;
}

export interface TimesheetStatsDTO {
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

export type PointageFilterDTO = TimesheetFilterDTO;

export type PointageStatsDTO = TimesheetStatsDTO;

export type ApiData<T> = ApiSuccessResponse<T>['data'];

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true;
}

export function isApiError(response: ApiResponse<any>): response is ApiErrorResponse {
    return response.success === false;
}

