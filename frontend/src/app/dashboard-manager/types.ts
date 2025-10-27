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
  // Relations (retournées par GET /api/users/{id})
  equipeNom?: string; // teamName depuis l'API
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
  password?: string; // Requis uniquement lors de la création
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

export type DashboardPage = 'dashboard' | 'agents' | 'equipes' | 'pointages';
