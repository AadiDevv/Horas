import { Agent, Equipe, ApiResponse } from '../types';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = false;

// Helper pour récupérer le token JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper pour transformer les données frontend -> backend
const transformAgentToBackend = (agent: Partial<Agent> & { password?: string }) => ({
  firstName: agent.prenom,
  lastName: agent.nom,
  email: agent.email,
  password: agent.password || 'TempPassword123!', // Mot de passe temporaire
  role: agent.role || 'employe',
  phone: agent.telephone,
  teamId: agent.equipeId
});

// Helper pour transformer les données backend -> frontend
const transformAgentFromBackend = (data: any): Agent => ({
  id: data.id,
  prenom: data.firstName,
  nom: data.lastName,
  email: data.email,
  role: data.role,
  telephone: data.phone,
  equipeId: data.teamId,
  isActive: data.isActive,
  createdAt: data.createdAt
});

// Helper pour récupérer le managerId du user connecté
const getManagerId = (): number => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('Utilisateur non connecté');
  }
  const user = JSON.parse(userStr);
  return user.id;
};

// Helper pour transformer les données équipe frontend -> backend
const transformEquipeToBackend = (equipe: any) => ({
  name: equipe.nom,
  description: equipe.description || undefined,
  managerId: getManagerId(), // Récupère l'ID du manager connecté
  // Note: agents et horaires ne sont pas gérés dans le DTO de création
  // Ils seront assignés via des routes séparées après la création
});

// Helper pour transformer les données équipe backend -> frontend
const transformEquipeFromBackend = (data: any): Equipe => ({
  id: data.id,
  nom: data.name,
  description: data.description,
  managerId: data.managerId,
  agentCount: data.membersCount || 0,
  createdAt: data.createdAt,
  agents: [], // Les agents ne sont pas retournés lors de la création
  horaires: [] // Les horaires ne sont pas retournés lors de la création
});

// Mock Data
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

// AGENTS
export async function getAgents(): Promise<ApiResponse<Agent[]>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockAgents };
  }

  // ⚠️ ATTENTION: Cette route n'est pas encore implémentée dans le backend
  // Les routes CRUD pour les users sont marquées "À venir" dans le Swagger
  console.warn('⚠️ GET /api/users n\'est pas encore implémenté dans le backend');
  throw new Error('La route GET /api/users n\'est pas encore disponible. Utilisez USE_MOCK=true');
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

  // Transformer les données frontend -> backend
  const backendData = transformAgentToBackend(agent);

  console.log('🚀 Envoi de la requête POST /api/users/register/employe');
  console.log('📦 Données envoyées:', backendData);
  console.log('🔑 Headers:', getAuthHeaders());

  const res = await fetch(`${API_BASE_URL}/api/users/register/employe`, {
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

  // Transformer la réponse backend -> frontend
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

  // ⚠️ ATTENTION: Cette route n'est pas encore implémentée dans le backend
  console.warn('⚠️ PATCH /api/users/:id n\'est pas encore implémenté dans le backend');
  throw new Error('La route PATCH /api/users/:id n\'est pas encore disponible. Utilisez USE_MOCK=true');
}

export async function deleteAgent(id: number): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === id);
    mockAgents.splice(index, 1);
    console.log('🗑️ Agent supprimé:', id);
    return { success: true };
  }

  // ⚠️ ATTENTION: Cette route n'est pas encore implémentée dans le backend
  console.warn('⚠️ DELETE /api/users/:id n\'est pas encore implémenté dans le backend');
  throw new Error('La route DELETE /api/users/:id n\'est pas encore disponible. Utilisez USE_MOCK=true');
}

// ÉQUIPES
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

  // Transformer chaque équipe de backend -> frontend
  return {
    success: response.success,
    data: response.data.map(transformEquipeFromBackend),
    message: response.message
  };
}

export async function createEquipe(equipe: any): Promise<ApiResponse<Equipe>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Convert agent IDs to agent objects
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

  // Transformer les données frontend -> backend
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

  // Note: Les agents et horaires doivent être assignés séparément après la création
  if (equipe.agents && equipe.agents.length > 0) {
    console.warn('⚠️ Les agents ne sont pas assignés automatiquement lors de la création.');
    console.warn('   Vous devrez mettre à jour chaque agent avec le teamId de cette équipe.');
  }

  // Transformer la réponse backend -> frontend
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

    // Convert agent IDs to agent objects if agents are provided
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

  // Transformer les données frontend -> backend (seulement les champs à mettre à jour)
  const backendData: any = {};
  if (updates.nom !== undefined) backendData.name = updates.nom;
  if (updates.description !== undefined) backendData.description = updates.description;
  // IMPORTANT : Ne jamais envoyer managerId lors de l'update

  // Vérifier l'utilisateur connecté
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

  // Note: Les agents doivent être mis à jour séparément
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
