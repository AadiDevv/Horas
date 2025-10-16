import { Agent, Equipe, ApiResponse } from '../types';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

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
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return res.json();
}

export async function createAgent(agent: Partial<Agent>): Promise<ApiResponse<Agent>> {
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
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agent)
  });
  return res.json();
}

export async function updateAgent(id: number, updates: Partial<Agent>): Promise<ApiResponse<Agent>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === id);
    mockAgents[index] = { ...mockAgents[index], ...updates };
    console.log('✅ Agent modifié:', mockAgents[index]);
    return { success: true, data: mockAgents[index] };
  }
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteAgent(id: number): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockAgents.findIndex(a => a.id === id);
    mockAgents.splice(index, 1);
    console.log('🗑️ Agent supprimé:', id);
    return { success: true };
  }
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, { method: 'DELETE' });
  return res.json();
}

// ÉQUIPES
export async function getEquipes(): Promise<ApiResponse<Equipe[]>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockEquipes };
  }
  const res = await fetch(`${API_BASE_URL}/api/equipes`);
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/api/equipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(equipe)
  });
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/api/equipes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteEquipe(id: number): Promise<ApiResponse<void>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEquipes.findIndex(e => e.id === id);
    mockEquipes.splice(index, 1);
    console.log('🗑️ Équipe supprimée:', id);
    return { success: true };
  }
  const res = await fetch(`${API_BASE_URL}/api/equipes/${id}`, { method: 'DELETE' });
  return res.json();
}
