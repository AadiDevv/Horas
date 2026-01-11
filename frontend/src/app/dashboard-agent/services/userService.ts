import { User, ApiResponse } from '../types';
import { apiClient } from '../../utils/apiClient';
import { API_CONFIG } from '@/constants/config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const USE_MOCK = API_CONFIG.USE_MOCK;

const mockUsers: User[] = [
  {
    id: 1,
    prenom: "Manijay",
    nom: "Gupta",
    email: "manijay@example.com",
    role: "employe",
    oldPassword: "password123",
    isActive: true,
    telephone: "+33 6 12 34 56 78",
    equipeId: 5,
    plageHoraireId: 2,
    createdAt: "2025-01-01T12:00:00.000Z",
    updatedAt: "2025-01-15T14:30:00.000Z",
    lastLoginAt: "2025-10-07T10:30:00.000Z",
    deletedAt: null
  }
];

interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  phone?: string;
  teamId?: number;
  scheduleId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string | null;
}

const transformUserFromBackend = (data: BackendUser): User => ({
  id: data.id,
  prenom: data.firstName,
  nom: data.lastName,
  email: data.email,
  role: data.role,
  isActive: data.isActive,
  telephone: data.phone,
  equipeId: data.teamId,
  plageHoraireId: data.scheduleId,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
  lastLoginAt: data.lastLoginAt,
  deletedAt: data.deletedAt
});

const transformUserToBackend = (updates: Partial<User>): Partial<BackendUser> => {
  const backendData: Partial<BackendUser> = {};
  if (updates.prenom !== undefined) backendData.firstName = updates.prenom;
  if (updates.nom !== undefined) backendData.lastName = updates.nom;
  if (updates.email !== undefined) backendData.email = updates.email;
  if (updates.telephone !== undefined) backendData.phone = updates.telephone;

  return backendData;
};

export async function getUser(userId: number): Promise<ApiResponse<User>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === userId);

    return {
      success: true,
      data: user,
      message: "Utilisateur récupéré avec succès",
      timestamp: new Date().toISOString()
    };
  }

  const requete = await apiClient.get(`${API_BASE_URL}/api/users/${userId}`);

  const response = await requete.json();

  if (!response.success || !response.data) {
    throw new Error(response.message || "Erreur récupération utilisateur");
  }

  return {
    ...response,
    data: transformUserFromBackend(response.data)
  };
}

export async function updateUser(userId: number, updates: Partial<User>): Promise<ApiResponse<User>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    const updatedUser = {
      ...mockUsers[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    mockUsers[userIndex] = updatedUser;


    return {
      success: true,
      data: updatedUser,
      message: "Utilisateur modifié avec succès",
      timestamp: new Date().toISOString()
    };
  }

  const backendData = transformUserToBackend(updates);

  const requete = await apiClient.patch(`${API_BASE_URL}/api/users/${userId}`, backendData);

  const response = await requete.json();

  if (!response.success || !response.data) {
     throw new Error(response.message || "Erreur mise à jour");
  }

  return {
    ...response,
    data: transformUserFromBackend(response.data)
  };
}

export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));


    const user = mockUsers.find(u => u.id === userId);
    if (user && user.oldPassword !== oldPassword) {
      return {
        success: false,
        message: "L'ancien mot de passe est incorrect",
        timestamp: new Date().toISOString()
      };
    }

    if (!oldPassword) {
      return {
        success: false,
        message: "Ancien mot de passe requis",
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      message: "Mot de passe modifié avec succès",
      timestamp: new Date().toISOString()
    };
  }

  const requete = await apiClient.patch(`${API_BASE_URL}/api/users/${userId}/password`, {
    oldPassword,
    newPassword
  });

  const response = await requete.json();

  if (!response.success) {
    throw new Error(response.message || "Erreur lors du changement de mot de passe");
  }

  return response;
}