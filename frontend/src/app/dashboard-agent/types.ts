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
}

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  timestamp: string;
}
