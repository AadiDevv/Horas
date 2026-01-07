import { Agent, Equipe, ApiResponse } from '../types';
import { apiClient, getAuthHeaders } from '@/app/utils/apiClient';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = false;

const handleHttpError = async (res: Response): Promise<never> => {
  const errorData = await res.json();

  throw new Error(errorData.error || errorData.message || `Erreur ${res.status}: ${res.statusText}`);
};

const transformAgentToBackend = (agent: Partial<Agent> & { password?: string }) => ({
  firstName: agent.prenom,
  lastName: agent.nom,
  email: agent.email,
  password: agent.password || 'TempPassword123!',
  role: agent.role || 'employe',
  phone: agent.telephone,
  teamId: agent.equipeId
});

const transformAgentUpdateToBackend = (updates: Partial<Agent>) => {
  const backendData: any = {};
  if (updates.prenom !== undefined) backendData.firstName = updates.prenom;
  if (updates.nom !== undefined) backendData.lastName = updates.nom;
  if (updates.email !== undefined) backendData.email = updates.email;
  if (updates.telephone !== undefined) backendData.phone = updates.telephone;
  if (updates.role !== undefined) backendData.role = updates.role;
  if (updates.isActive !== undefined) backendData.isActive = updates.isActive;

  return backendData;
};

const transformAgentFromBackend = (data: any): Agent => ({
  id: data.id,
  prenom: data.firstName,
  nom: data.lastName,
  email: data.email,
  role: data.role,
  telephone: data.phone || '',
  equipeId: data.teamId,
  managerId: data.managerId,
  scheduleId: data.scheduleId,
  isActive: data.isActive ?? true,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt,
  lastLoginAt: data.lastLoginAt,
  deletedAt: data.deletedAt,

  equipeNom: data.teamName || data.teamlastName,
  manager: data.manager ? {
    id: data.manager.id,
    prenom: data.manager.firstName,
    nom: data.manager.lastName
  } : undefined,
  team: data.team ? {
    id: data.team.id,
    nom: data.team.name
  } : undefined,
  schedule: data.schedule ? {
    id: data.schedule.id,
    nom: data.schedule.name,
    heureDebut: data.schedule.startHour,
    heureFin: data.schedule.endHour
  } : undefined
});

const getManagerId = (): number => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('Utilisateur non connecté');
  }
  const user = JSON.parse(userStr);
  return user.id;
};

const transformEquipeToBackend = (equipe: any) => ({
  name: equipe.nom,
  description: equipe.description || undefined,
  managerId: getManagerId(),

});

const transformEquipeFromBackend = (data: any): Equipe => ({
  id: data.id,
  nom: data.name,
  description: data.description,
  managerId: data.managerId,
  scheduleId: data.scheduleId,
  agentCount: data.membersCount || 0,
  createdAt: data.createdAt,
  deletedAt: data.deletedAt,
  agents: [],
  horaires: []
});

const mockAgents: Agent[] = [
  {
    id: 1,
    prenom: "John",
    nom: "Ekeler",
    email: "john.ekeler@example.com",
    role: "employe",
    telephone: "+33 6 12 34 56 78",
    equipeId: 1,
    isActive: true,
    createdAt: "2025-01-01T12:00:00.000Z"
  },
  {
    id: 2,
    prenom: "Rubik",
    nom: "Sans",
    email: "rubik.sans@example.com",
    role: "employe",
    telephone: "+33 6 98 76 54 32",
    equipeId: 1,
    isActive: true,
    createdAt: "2025-01-02T12:00:00.000Z"
  }
];

const mockEquipes: Equipe[] = [
  {
    id: 1,
    nom: "Équipe Alpha",
    description: "Équipe principale de développement",
    managerId: 1,
    agentCount: 2,
    createdAt: "2025-01-01T12:00:00.000Z",
    agents: [mockAgents[0], mockAgents[1]],
    horaires: [
      { jour: 'Lundi', heureDebut: '09:00', heureFin: '17:00' },
      { jour: 'Mardi', heureDebut: '09:00', heureFin: '17:00' }
    ]
  },
  {
    id: 2,
    nom: "Équipe Beta",
    description: "Équipe support client",
    managerId: 2,
    agentCount: 0,
    createdAt: "2025-01-05T12:00:00.000Z",
    agents: [],
    horaires: []
  }
];

export async function getAgents(): Promise<ApiResponse<Agent[]>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockAgents };
  }

  console.log('🚀 Envoi de la requête GET /api/users/my-employees');
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/my-employees`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText );
  console.log('auth headers:', getAuthHeaders());
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);
  console.log('📊 Nombre d\'employés dans response.data:', response.data?.length || 0);

  if (response.data && response.data.length > 0) {
    console.log('🔍 Premier employé brut:', response.data[0]);
  }

  const transformedData = response.data.map(transformAgentFromBackend);
  console.log('🔄 Données transformées:', transformedData);

  return {
    success: response.success,
    data: transformedData,
    message: response.message
  };
}

export async function createAgent(agent: Partial<Agent> & { password?: string }): Promise<ApiResponse<Agent>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAgent = {
      id: mockAgents.length + 1,
      ...agent,
      isActive: true,
      createdAt: new Date().toISOString()
    } as Agent;
    mockAgents.push(newAgent);
    console.log('✅ Agent créé:', newAgent);
    return { success: true, data: newAgent };
  }

  const backendData = transformAgentToBackend(agent);

  console.log('🚀 Envoi de la requête POST /api/auth/register/employe');
  console.log('📦 Données envoyées:', backendData);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/auth/register/employe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}

export async function updateAgent(id: number, updates: Partial<Agent>): Promise<ApiResponse<Agent>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === id);
    mockAgents[index] = { ...mockAgents[index], ...updates };
    console.log('✅ Agent modifié:', mockAgents[index]);
    return { success: true, data: mockAgents[index] };
  }

  const backendData = transformAgentUpdateToBackend(updates);

  console.log('🚀 Envoi de la requête PATCH /api/users/' + id);
  console.log('📦 Données envoyées:', backendData);

  const res = await apiClient.patch(`${API_BASE_URL}/api/users/${id}`, backendData);

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}

export async function deleteAgent(id: number): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === id);
    mockAgents.splice(index, 1);
    console.log('🗑️ Agent supprimé:', id);
    return { success: true };
  }

  console.log('🚀 Envoi de la requête DELETE /api/users/' + id);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();
  console.log('✅ Agent supprimé:', response);

  return {
    success: response.success,
    message: response.message
  };
}

export async function getUserById(id: number): Promise<ApiResponse<Agent>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const agent = mockAgents.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent non trouvé');
    }
    return { success: true, data: agent };
  }

  console.log('🚀 Envoi de la requête GET /api/users/' + id);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}

export async function assignUserToTeam(userId: number, teamId: number): Promise<ApiResponse<Agent>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === userId);
    if (index === -1) {
      throw new Error('Agent non trouvé');
    }
    mockAgents[index].equipeId = teamId;
    console.log('✅ Agent assigné à l\'équipe:', mockAgents[index]);
    return { success: true, data: mockAgents[index] };
  }

  console.log('🚀 Envoi de la requête PATCH /api/users/assign/team/' + userId);
  console.log('📦 Données envoyées:', { teamId });
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/assign/team/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ teamId })
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}

export async function changeUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Mot de passe modifié (mock)');
    return { success: true, message: 'Mot de passe modifié avec succès' };
  }

  console.log('🚀 Envoi de la requête PATCH /api/users/' + userId + '/password');
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword })
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();
  console.log('✅ Mot de passe modifié:', response);

  return {
    success: response.success,
    message: response.message
  };
}

export async function getEquipes(): Promise<ApiResponse<Equipe[]>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockEquipes };
  }

  console.log('🚀 Envoi de la requête GET /api/teams');

  const res = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  if (response.data && response.data.length > 0) {
    console.log('🔍 Première équipe brute du backend:', response.data[0]);
  }

  const allEquipes = response.data.map(transformEquipeFromBackend);
  console.log('🔄 Première équipe transformée:', allEquipes[0]);
  const activeEquipes = allEquipes.filter((equipe: Equipe) => !equipe.deletedAt);

  console.log('📊 Équipes totales:', allEquipes.length, '| Actives:', activeEquipes.length);

  return {
    success: response.success,
    data: activeEquipes,
    message: response.message
  };
}

export async function createEquipe(equipe: any): Promise<ApiResponse<Equipe>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const agentObjects = equipe.agents
      ? mockAgents.filter((a: Agent) => equipe.agents.includes(a.id))
      : [];

    const newEquipe = {
      id: mockEquipes.length + 1,
      nom: equipe.nom,
      description: equipe.description,
      agentCount: agentObjects.length,
      agents: agentObjects,
      horaires: equipe.horaires || [],
      createdAt: new Date().toISOString()
    } as Equipe;
    mockEquipes.push(newEquipe);
    console.log('✅ Équipe créée:', newEquipe);
    return { success: true, data: newEquipe };
  }

  const backendData = transformEquipeToBackend(equipe);

  console.log('🚀 Envoi de la requête POST /api/teams');
  console.log('📦 Données envoyées:', backendData);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  if (equipe.agents && equipe.agents.length > 0) {
    console.warn('⚠️ Les agents ne sont pas assignés automatiquement lors de la création.');
    console.warn('   Vous devrez mettre à jour chaque agent avec le teamId de cette équipe.');
  }

  return {
    success: response.success,
    data: transformEquipeFromBackend(response.data),
    message: response.message
  };
}

export async function updateEquipe(id: number, updates: any): Promise<ApiResponse<Equipe>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEquipes.findIndex(e => e.id === id);

    const agentObjects = updates.agents
      ? mockAgents.filter((a: Agent) => updates.agents.includes(a.id))
      : mockEquipes[index].agents;

    const updatedEquipe = {
      ...mockEquipes[index],
      nom: updates.nom !== undefined ? updates.nom : mockEquipes[index].nom,
      description: updates.description !== undefined ? updates.description : mockEquipes[index].description,
      agents: agentObjects,
      horaires: updates.horaires !== undefined ? updates.horaires : mockEquipes[index].horaires,
      agentCount: agentObjects?.length || 0
    };
    mockEquipes[index] = updatedEquipe;
    console.log('✅ Équipe modifiée:', mockEquipes[index]);
    return { success: true, data: mockEquipes[index] };
  }

  const backendData: any = {};
  if (updates.nom !== undefined) backendData.name = updates.nom;
  if (updates.description !== undefined) backendData.description = updates.description;

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  console.log('🚀 Envoi de la requête PATCH /api/teams/' + id);
  console.log('👤 User connecté:', currentUser);
  console.log('📦 Updates reçus:', updates);
  console.log('📦 Données transformées envoyées:', backendData);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();
  console.log('✅ Réponse du serveur:', response);

  if (updates.agents && updates.agents.length > 0) {
    console.warn('⚠️ Les agents doivent être mis à jour séparément via PATCH /api/users/:id avec teamId');
  }

  return {
    success: response.success,
    data: transformEquipeFromBackend(response.data),
    message: response.message
  };
}

export async function deleteEquipe(id: number): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEquipes.findIndex(e => e.id === id);
    mockEquipes.splice(index, 1);
    console.log('🗑️ Équipe supprimée:', id);
    return { success: true };
  }

  console.log('🚀 Envoi de la requête DELETE /api/teams/' + id);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();
  console.log('✅ Équipe supprimée:', response);

  return {
    success: response.success,
    message: response.message
  };
}

export async function createSchedule(schedule: { name: string; startHour: string; endHour: string; activeDays: number[] }): Promise<ApiResponse<any>> {
  console.log('🚀 Envoi de la requête POST /api/schedules');
  console.log('📦 Données envoyées:', schedule);

  const res = await fetch(`${API_BASE_URL}/api/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(schedule)
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Schedule créé:', response);

  return {
    success: response.success,
    data: response.data,
    message: response.message
  };
}

export async function assignScheduleToTeam(teamId: number, scheduleId: number): Promise<ApiResponse<Equipe>> {
  console.log('🚀 Envoi de la requête PATCH /api/teams/' + teamId);
  console.log('📦 Données envoyées:', { scheduleId });

  const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheduleId })
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Schedule assigné à l\'équipe:', response);

  return {
    success: response.success,
    data: transformEquipeFromBackend(response.data),
    message: response.message
  };
}

export async function getScheduleById(scheduleId: number): Promise<ApiResponse<any>> {
  console.log('🚀 Envoi de la requête GET /api/schedules/' + scheduleId);

  const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Schedule récupéré:', response);

  return {
    success: response.success,
    data: response.data,
    message: response.message
  };
}

export async function updateSchedule(scheduleId: number, updates: { name?: string; startHour?: string; endHour?: string; activeDays?: number[] }): Promise<ApiResponse<any>> {
  console.log('🚀 Envoi de la requête PATCH /api/schedules/' + scheduleId);
  console.log('📦 Données envoyées:', updates);

  const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });

  console.log('📡 Statut de la réponse:', res.status, res.statusText);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ Erreur du serveur:', errorText);
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();
  console.log('✅ Schedule mis à jour:', response);

  return {
    success: response.success,
    data: response.data,
    message: response.message
  };
}

// ==================== SCHEDULE FUNCTIONS ====================

/**
 * Récupère la liste de tous les schedules
 */
export async function getSchedules(): Promise<ApiResponse<any[]>> {
  try {
    console.log('🚀 GET /api/schedules');

    const res = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const schedules = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/schedules - ${schedules.length} schedules retrieved`);

    return {
      success: true,
      data: schedules
    };
  } catch (error) {
    console.error('❌ Error getSchedules:', error);
    return {
      success: false,
      data: [],
      error: (error as Error).message
    };
  }
}

/**
 * Supprime un schedule
 */
export async function deleteSchedule(scheduleId: number): Promise<ApiResponse<void>> {
  try {
    console.log('🚀 DELETE /api/schedules/:id', scheduleId);

    const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    console.log(`✅ DELETE /api/schedules/${scheduleId} - Schedule deleted`);

    return {
      success: true,
      message: 'Schedule supprimé avec succès'
    };
  } catch (error) {
    console.error('❌ Error deleteSchedule:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}
