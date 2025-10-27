import { User, ApiResponse } from '../types';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

// Mock Data
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

export async function getUser(userId: number): Promise<ApiResponse<User>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.id === userId);
    console.log('🔍 Mock GET /api/users/' + userId);
    console.log('✅ Réponse:', user);

    return {
      success: true,
      data: user,
      message: "Utilisateur récupéré avec succès",
      timestamp: new Date().toISOString()
    };
  }

  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}`);
  if (!requete.ok) {
    throw new Error("Erreur récupération utilisateur");
  }
  const user = await requete.json();
  return user;
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
    
    console.log('🔄 Mock PATCH /api/users/' + userId);
    console.log('📝 Données envoyées:', updates);
    console.log('✅ Utilisateur mis à jour:', updatedUser);
    
    return {
      success: true,
      data: updatedUser,
      message: "Utilisateur modifié avec succès",
      timestamp: new Date().toISOString()
    };
  }
  
  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  if (!requete.ok) {
    throw new Error("Erreur mise à jour");
  }
  const user = await requete.json();
  return user;
}

export async function changePassword(
  userId: number, 
  oldPassword: string, 
  newPassword: string
): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('🔒 Mock PATCH /api/users/' + userId + '/password');
    console.log('📝 Changement de mot de passe simulé');
    
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
  
  const requete = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  
  const response = await requete.json();
  
  if (!requete.ok || !response.success) {
    throw new Error(response.message || "Erreur lors du changement de mot de passe");
  }
  
  return response;
}
