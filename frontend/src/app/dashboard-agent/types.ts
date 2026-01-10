export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  oldPassword?: string;
  isActive: boolean;
  telephone?: string;
  equipeId?: number;
  plageHoraireId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string | null;
}

export interface UserFormData {
  prenom: string;
  nom: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TimeLog {
  start: string;
  end?: string;
  status?: 'normal' | 'retard' | 'absence';
}

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface Horaire {
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export type {
  PointageStatus,
  PointageReadDTO as PointageReadDTO_Backend,
  PointageCreateDTO,
  ApiSuccessResponse,
  UserReadDTO
} from '../types/backend-generated';

export interface PointageReadDTO extends Omit<import('../types/backend-generated').PointageReadDTO, never> {
  heure: string;
}
