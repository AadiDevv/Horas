export interface Agent {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  equipeId?: number;
  managerId?: number;
  scheduleId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  deletedAt?: string;

  equipeNom?: string;
  manager?: {
    id: number;
    prenom: string;
    nom: string;
  };
  team?: {
    id: number;
    nom: string;
  };
  schedule?: {
    id: number;
    nom: string;
    heureDebut: string;
    heureFin: string;
  };
}

export interface Horaire {
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface Equipe {
  id: number;
  nom: string;
  description?: string;
  managerId?: number;
  scheduleId?: number;
  agentCount: number;
  createdAt: string;
  deletedAt?: string;
  agents?: Agent[];
  horaires?: Horaire[];
}

export interface AgentFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  equipeId: string;
  password?: string;
  customScheduleId?: number | null;
}

export interface EquipeFormData {
  nom: string;
  description: string;
  agents: number[];
  scheduleId?: number;
}

export interface Manager {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
}

export interface ManagerFormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

export interface Schedule {
  id: number;
  name: string;
  startHour: string;
  endHour: string;
  activeDays: number[];
  usersCount?: number;
  managerId?: number;
  createdAt: string;
  updatedAt?: string;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  teams?: Array<{
    id: number;
    name: string;
    membersCount: number;
  }>;
}

export interface ScheduleFormData {
  name: string;
  startHour: string;
  endHour: string;
  activeDays: number[];
}

export type DashboardPage = 'dashboard' | 'agents' | 'equipes' | 'pointages' | 'horaires';
