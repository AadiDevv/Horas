// SOURCE DE VERITE POUR LE FRONT

// ⭐ SOURCE DE VÉRITÉ - Modifié uniquement par le backend
export type UserRole = 'employe' | 'manager' | 'admin';

export type User = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: UserRole;
  telephone?: string;
  equipeId?: number;
  plageHoraireId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
};

export type CreateUserDTO = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  role: UserRole;
  telephone?: string;
  equipeId?: number;
  plageHoraireId?: number;
};

export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'password'>>;

export type ChangePasswordDTO = {
  oldPassword: string;
  newPassword: string;
};

export type Equipe = {
  id: number;
  nom: string;
  description?: string;
  managerId?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateEquipeDTO = {
  nom: string;
  description?: string;
  managerId?: number;
};

export type UpdateEquipeDTO = Partial<CreateEquipeDTO>;

export type JourSemaine = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export type PlageHoraire = {
  id: number;
  nom: string;
  description?: string;
  heureDebut: string;
  heureFin: string;
  joursSemaine: JourSemaine[];
  createdAt: string;
  updatedAt: string;
};

export type CreatePlageHoraireDTO = {
  nom: string;
  description?: string;
  heureDebut: string;
  heureFin: string;
  joursSemaine: JourSemaine[];
};

export type UpdatePlageHoraireDTO = Partial<CreatePlageHoraireDTO>;

export type TypePointage = 'arrivee' | 'depart';

export type Pointage = {
  id: number;
  userId: number;
  type: TypePointage;
  horodatage: string;
  localisation?: string;
  remarque?: string;
  isRetard: boolean;
  dureeRetard?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreatePointageDTO = {
  userId: number;
  type: TypePointage;
  localisation?: string;
  remarque?: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type RegisterDTO = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  telephone?: string;
};

export type AuthResponse = {
  success: boolean;
  data?: {
    user: {
      id: number;
      prenom: string;
      nom: string;
      email: string;
      role: string;
    };
    token: string;
  };
  message?: string;
};