export interface Agent {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  equipeId?: number;
  isActive: boolean;
  createdAt: string;
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
  agentCount: number;
  createdAt: string;
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
}

export interface EquipeFormData {
  nom: string;
  description: string;
  agents: number[];
  horaires: Horaire[];
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

export type DashboardPage = 'dashboard' | 'agents' | 'equipes';
