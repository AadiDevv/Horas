import { Agent, Equipe, ApiResponse } from '../types';
import { apiClient, getAuthHeaders } from '@/app/utils/apiClient';
import { API_CONFIG } from '@/constants/config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const USE_MOCK = API_CONFIG.USE_MOCK;

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


  const res = await fetch(`${API_BASE_URL}/api/users/my-employees`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

  if (response.data && response.data.length > 0) {
  }

  const transformedData = response.data.map(transformAgentFromBackend);

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
    return { success: true, data: newAgent };
  }

  const backendData = transformAgentToBackend(agent);


  const res = await fetch(`${API_BASE_URL}/api/auth/register/employe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });


  if (!res.ok) {
    const errorText = await res.text();

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();

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
    return { success: true, data: mockAgents[index] };
  }

  const backendData = transformAgentUpdateToBackend(updates);


  const res = await apiClient.patch(`${API_BASE_URL}/api/users/${id}`, backendData);


  const response = await res.json();

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
    return { success: true };
  }


  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });


  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();

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


  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

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
    return { success: true, data: mockAgents[index] };
  }


  const res = await fetch(`${API_BASE_URL}/api/users/assign/team/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ teamId })
  });


  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}

export async function changeUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Mot de passe modifié avec succès' };
  }


  const res = await fetch(`${API_BASE_URL}/api/users/${userId}/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword })
  });


  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();

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


  const res = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'GET',
    headers: getAuthHeaders()
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

  if (response.data && response.data.length > 0) {
  }

  const allEquipes = response.data.map(transformEquipeFromBackend);
  const activeEquipes = allEquipes.filter((equipe: Equipe) => !equipe.deletedAt);


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
    return { success: true, data: newEquipe };
  }

  const backendData = transformEquipeToBackend(equipe);


  const res = await fetch(`${API_BASE_URL}/api/teams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });


  if (!res.ok) {
    const errorText = await res.text();

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();

  if (equipe.agents && equipe.agents.length > 0) {
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
    return { success: true, data: mockEquipes[index] };
  }

  const backendData: any = {};
  if (updates.nom !== undefined) backendData.name = updates.nom;
  if (updates.description !== undefined) backendData.description = updates.description;

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;


  const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData)
  });


  if (!res.ok) {
    const errorText = await res.text();

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();

  if (updates.agents && updates.agents.length > 0) {
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
    return { success: true };
  }


  const res = await fetch(`${API_BASE_URL}/api/teams/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });


  if (!res.ok) {
    const errorText = await res.text();

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.message || `Erreur ${res.status}: ${res.statusText}`);
    } catch (e) {
      throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
    }
  }

  const response = await res.json();

  return {
    success: response.success,
    message: response.message
  };
}

export async function createSchedule(schedule: { name: string; startHour: string; endHour: string; activeDays: number[] }): Promise<ApiResponse<any>> {

  const res = await fetch(`${API_BASE_URL}/api/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(schedule)
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

  return {
    success: response.success,
    data: response.data,
    message: response.message
  };
}

export async function assignScheduleToTeam(teamId: number, scheduleId: number): Promise<ApiResponse<Equipe>> {

  const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheduleId })
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

  return {
    success: response.success,
    data: transformEquipeFromBackend(response.data),
    message: response.message
  };
}

export async function getScheduleById(scheduleId: number): Promise<ApiResponse<any>> {

  const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

  return {
    success: response.success,
    data: response.data,
    message: response.message
  };
}

export async function updateSchedule(scheduleId: number, updates: { name?: string; startHour?: string; endHour?: string; activeDays?: number[] }): Promise<ApiResponse<any>> {

  const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });


  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
  }

  const response = await res.json();

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

    const res = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const schedules = Array.isArray(data) ? data : (data.data || []);


    return {
      success: true,
      data: schedules
    };
  } catch (error) {
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

    const res = await fetch(`${API_BASE_URL}/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }


    return {
      success: true,
      message: 'Schedule supprimé avec succès'
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Assigne un custom schedule à un agent
 * @param userId - ID de l'agent
 * @param scheduleId - ID du schedule (ou null pour retirer le custom schedule)
 */
export async function assignCustomScheduleToUser(
  userId: number,
  scheduleId: number | null
): Promise<ApiResponse<Agent>> {

  const res = await fetch(`${API_BASE_URL}/api/users/assign/schedule/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ scheduleId })
  });

  if (!res.ok) {
    await handleHttpError(res);
  }

  const response = await res.json();

  return {
    success: response.success,
    data: transformAgentFromBackend(response.data),
    message: response.message
  };
}
