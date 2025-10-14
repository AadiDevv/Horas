'use client';

import { useState, useEffect } from 'react';
import { Clock, Menu, Bell, Users, UserPlus, Folder, Settings, FileText, User, X, Loader2, Edit2, Trash2, Eye } from 'lucide-react';
import Navbar from '../components/navbar';
import RoleProtection from '../middleware/roleProtection';

// ==================== TYPES ====================
type Agent = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  equipeId?: number;
  isActive: boolean;
  createdAt: string;
};

type Equipe = {
  id: number;
  nom: string;
  description?: string;
  managerId?: number;
  agentCount: number;
  createdAt: string;
};

// ==================== MOCK DATA ====================
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
    agentCount: 5,
    createdAt: "2025-01-01T12:00:00.000Z"
  },
  {
    id: 2,
    nom: "Équipe Beta",
    description: "Équipe support client",
    managerId: 2,
    agentCount: 3,
    createdAt: "2025-01-05T12:00:00.000Z"
  }
];

// ==================== API SERVICE ====================
const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

// AGENTS
async function getAgents() {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockAgents };
  }
  const res = await fetch(`${API_BASE_URL}/api/users`);
  return res.json();
}

async function createAgent(agent: Partial<Agent>) {
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

async function updateAgent(id: number, updates: Partial<Agent>) {
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

async function deleteAgent(id: number) {
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
async function getEquipes() {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockEquipes };
  }
  const res = await fetch(`${API_BASE_URL}/api/equipes`);
  return res.json();
}

async function createEquipe(equipe: Partial<Equipe>) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEquipe = {
      id: mockEquipes.length + 1,
      ...equipe,
      agentCount: 0,
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

async function updateEquipe(id: number, updates: Partial<Equipe>) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockEquipes.findIndex(e => e.id === id);
    mockEquipes[index] = { ...mockEquipes[index], ...updates };
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

async function deleteEquipe(id: number) {
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

// ==================== MAIN COMPONENT ====================
export default function Page() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'agents' | 'equipes'>('dashboard');
  
  // Modales
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [equipeModalOpen, setEquipeModalOpen] = useState(false);
  
  // Data
  const [agents, setAgents] = useState<Agent[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [agentForm, setAgentForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', role: 'employe', equipeId: ''
  });
  const [equipeForm, setEquipeForm] = useState({
    nom: '', description: ''
  });
  
  // Édition
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadData();
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [agentsRes, equipesRes] = await Promise.all([getAgents(), getEquipes()]);
    if (agentsRes.success) setAgents(agentsRes.data);
    if (equipesRes.success) setEquipes(equipesRes.data);
    setLoading(false);
  };

  const formatDate = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${days[date.getDay()]} ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()} | ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // AGENT HANDLERS
  const handleCreateAgent = async () => {
    setLoading(true);
    const res = await createAgent({
      ...agentForm,
      equipeId: agentForm.equipeId ? parseInt(agentForm.equipeId) : undefined
    });
    if (res.success) {
      await loadData();
      setAgentModalOpen(false);
      setAgentForm({ prenom: '', nom: '', email: '', telephone: '', role: 'employe', equipeId: '' });
      setCurrentPage('agents');
    }
    setLoading(false);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent) return;
    setLoading(true);
    const res = await updateAgent(editingAgent.id, {
      ...agentForm,
      equipeId: agentForm.equipeId ? parseInt(agentForm.equipeId) : undefined
    });
    if (res.success) {
      await loadData();
      setEditingAgent(null);
      setAgentForm({ prenom: '', nom: '', email: '', telephone: '', role: 'employe', equipeId: '' });
    }
    setLoading(false);
  };

  const handleDeleteAgent = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;
    setLoading(true);
    await deleteAgent(id);
    await loadData();
    setLoading(false);
  };

  const openEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setAgentForm({
      prenom: agent.prenom,
      nom: agent.nom,
      email: agent.email,
      telephone: agent.telephone || '',
      role: agent.role,
      equipeId: agent.equipeId?.toString() || ''
    });
  };

  // ÉQUIPE HANDLERS
  const handleCreateEquipe = async () => {
    setLoading(true);
    const res = await createEquipe(equipeForm);
    if (res.success) {
      await loadData();
      setEquipeModalOpen(false);
      setEquipeForm({ nom: '', description: '' });
      setCurrentPage('equipes');
    }
    setLoading(false);
  };

  const handleUpdateEquipe = async () => {
    if (!editingEquipe) return;
    setLoading(true);
    const res = await updateEquipe(editingEquipe.id, equipeForm);
    if (res.success) {
      await loadData();
      setEditingEquipe(null);
      setEquipeForm({ nom: '', description: '' });
    }
    setLoading(false);
  };

  const handleDeleteEquipe = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    setLoading(true);
    await deleteEquipe(id);
    await loadData();
    setLoading(false);
  };

  const openEditEquipe = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setEquipeForm({
      nom: equipe.nom,
      description: equipe.description || ''
    });
  };

  return (
    <RoleProtection allowedRoles={['manager', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        
        <div className="flex">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-64 p-6 space-y-2 bg-white/60 backdrop-blur-xl border-r border-gray-200/50">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === 'dashboard' 
                    ? 'bg-black text-white shadow-lg shadow-black/10' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                  <div className="w-2 h-2 bg-current rounded-sm"></div>
                </div>
                Tableau de bord
              </button>
              
              <button 
                onClick={() => setCurrentPage('agents')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === 'agents' 
                    ? 'bg-black text-white shadow-lg shadow-black/10' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} strokeWidth={2} />
                Agents
              </button>

              <button 
                onClick={() => setCurrentPage('equipes')}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === 'equipes' 
                    ? 'bg-black text-white shadow-lg shadow-black/10' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Folder size={20} strokeWidth={2} />
                Équipes
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <FileText size={20} strokeWidth={2} />
                Rapports
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:bg-gray-100">
                <Settings size={20} strokeWidth={2} />
                Paramètres
              </button>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 p-8">
            {/* DASHBOARD PAGE */}
            {currentPage === 'dashboard' && (
              <>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Aujourd'hui</h2>
                    <p className="text-gray-600 font-medium">{mounted && currentTime ? formatDate(currentTime) : 'Chargement...'}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setEquipeModalOpen(true)}
                      className="flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Users size={20} strokeWidth={2} />
                      Créer une équipe
                    </button>
                    <button 
                      onClick={() => setAgentModalOpen(true)}
                      className="flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-black/20"
                    >
                      <UserPlus size={20} strokeWidth={2} />
                      Ajouter un agent
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Heures Total Semaine</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-semibold">40:00:05</span>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Clock size={28} className="text-gray-700" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Agents Actifs</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-semibold">{agents.filter(a => a.isActive).length}</span>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <User size={28} className="text-gray-700" strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Équipes</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-semibold">{equipes.length}</span>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <Folder size={28} className="text-gray-700" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* AGENTS PAGE */}
            {currentPage === 'agents' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-semibold">Gestion des Agents</h2>
                  <button 
                    onClick={() => setAgentModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all"
                  >
                    <UserPlus size={20} />
                    Ajouter un agent
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="space-y-4">
                    {agents.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold text-lg">{agent.prenom} {agent.nom}</p>
                            <p className="text-sm text-gray-600">{agent.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditAgent(agent)}
                            className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ÉQUIPES PAGE */}
            {currentPage === 'equipes' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-semibold">Gestion des Équipes</h2>
                  <button 
                    onClick={() => setEquipeModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all"
                  >
                    <Users size={20} />
                    Créer une équipe
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {equipes.map(equipe => (
                    <div key={equipe.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{equipe.nom}</h3>
                          <p className="text-sm text-gray-600 mb-4">{equipe.description}</p>
                          <p className="text-sm text-gray-500">{equipe.agentCount} agents</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditEquipe(equipe)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEquipe(equipe.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* MODALE AGENT */}
        {(agentModalOpen || editingAgent) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{editingAgent ? 'Modifier l\'agent' : 'Nouvel Agent'}</h2>
                <button 
                  onClick={() => {
                    setAgentModalOpen(false);
                    setEditingAgent(null);
                    setAgentForm({ prenom: '', nom: '', email: '', telephone: '', role: 'employe', equipeId: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prénom</label>
                    <input 
                      type="text"
                      value={agentForm.prenom}
                      onChange={(e) => setAgentForm({...agentForm, prenom: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nom</label>
                    <input 
                      type="text"
                      value={agentForm.nom}
                      onChange={(e) => setAgentForm({...agentForm, nom: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input 
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm({...agentForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Téléphone</label>
                  <input 
                    type="tel"
                    value={agentForm.telephone}
                    onChange={(e) => setAgentForm({...agentForm, telephone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Rôle</label>
                  <select 
                    value={agentForm.role}
                    onChange={(e) => setAgentForm({...agentForm, role: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="employe">Employé</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Équipe</label>
                  <select 
                    value={agentForm.equipeId}
                    onChange={(e) => setAgentForm({...agentForm, equipeId: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Aucune équipe</option>
                    {equipes.map(e => (
                      <option key={e.id} value={e.id}>{e.nom}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={editingAgent ? handleUpdateAgent : handleCreateAgent}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editingAgent ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    editingAgent ? 'Modifier' : 'Créer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODALE ÉQUIPE */}
        {(equipeModalOpen || editingEquipe) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{editingEquipe ? 'Modifier l\'équipe' : 'Nouvelle Équipe'}</h2>
                <button 
                  onClick={() => {
                    setEquipeModalOpen(false);
                    setEditingEquipe(null);
                    setEquipeForm({ nom: '', description: '' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom de l'équipe</label>
                  <input 
                    type="text"
                    value={equipeForm.nom}
                    onChange={(e) => setEquipeForm({...equipeForm, nom: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea 
                    value={equipeForm.description}
                    onChange={(e) => setEquipeForm({...equipeForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                <button 
                  onClick={editingEquipe ? handleUpdateEquipe : handleCreateEquipe}
                  disabled={loading}
                  className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {editingEquipe ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    editingEquipe ? 'Modifier' : 'Créer'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleProtection>
  );
}