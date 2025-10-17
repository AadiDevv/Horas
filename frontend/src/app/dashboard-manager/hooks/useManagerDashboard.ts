import { useState, useEffect } from 'react';
import { Agent, Equipe, AgentFormData, EquipeFormData, DashboardPage, Manager, ManagerFormData } from '../types';
import * as api from '../services/apiService';

export function useManagerDashboard() {
  const [currentPage, setCurrentPage] = useState<DashboardPage>('dashboard');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${days[date.getDay()]} ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()} | ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formattedDate = mounted ? formatDate(currentTime) : 'Chargement...';

  return {
    currentPage,
    setCurrentPage,
    formattedDate
  };
}

export function useAgentManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role: 'employe',
    equipeId: ''
  });

  // Filter agents when search term changes
  useEffect(() => {
    const filtered = agents.filter((agent) =>
      `${agent.prenom} ${agent.nom} ${agent.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(filtered);
  }, [searchTerm, agents]);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const result = await api.getAgents();
      if (result.success && result.data) {
        setAgents(result.data);
        setFilteredAgents(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement agents:', error);
    }
    setLoadingAgents(false);
  };

  const handleCreate = async () => {
    const newAgent = {
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      role: formData.role,
      telephone: formData.telephone || undefined,
      equipeId: formData.equipeId ? Number(formData.equipeId) : undefined,
      password: formData.password // Ajout du mot de passe
    };
    const result = await api.createAgent(newAgent);
    if (result.success) {
      await loadAgents();
      setShowModal(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingAgent) return;
    const updates = {
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      role: formData.role,
      telephone: formData.telephone || undefined,
      equipeId: formData.equipeId ? Number(formData.equipeId) : undefined
    };
    const result = await api.updateAgent(editingAgent.id, updates);
    if (result.success) {
      await loadAgents();
      setShowModal(false);
      setEditingAgent(null);
      resetForm();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;
    const result = await api.deleteAgent(id);
    if (result.success) {
      await loadAgents();
    }
  };

  const openEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      prenom: agent.prenom,
      nom: agent.nom,
      email: agent.email,
      role: agent.role,
      telephone: agent.telephone || '',
      equipeId: agent.equipeId?.toString() || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: 'employe',
      equipeId: ''
    });
    setEditingAgent(null);
  };

  return {
    agents,
    filteredAgents,
    loadingAgents,
    searchTerm,
    setSearchTerm,
    showModal,
    setShowModal,
    editingAgent,
    formData,
    setFormData,
    loadAgents,
    handleCreate,
    handleUpdate,
    handleDelete,
    openEditModal,
    resetForm
  };
}

export function useEquipeManager() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipe, setEditingEquipe] = useState<Equipe | null>(null);
  const [formData, setFormData] = useState<EquipeFormData>({
    nom: '',
    description: '',
    agents: [],
    horaires: []
  });

  const loadEquipes = async () => {
    setLoadingEquipes(true);
    try {
      const result = await api.getEquipes();
      if (result.success && result.data) {
        setEquipes(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement équipes:', error);
    }
    setLoadingEquipes(false);
  };

  const handleCreate = async () => {
    const newEquipe = {
      nom: formData.nom,
      description: formData.description || undefined,
      agents: formData.agents,
      horaires: formData.horaires
    };
    const result = await api.createEquipe(newEquipe);
    if (result.success) {
      await loadEquipes();
      setShowModal(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingEquipe) return;
    const updates = {
      nom: formData.nom,
      description: formData.description || undefined,
      agents: formData.agents,
      horaires: formData.horaires
    };
    const result = await api.updateEquipe(editingEquipe.id, updates);
    if (result.success) {
      await loadEquipes();
      setShowModal(false);
      setEditingEquipe(null);
      resetForm();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    const result = await api.deleteEquipe(id);
    if (result.success) {
      await loadEquipes();
    }
  };

  const openEditModal = (equipe: Equipe) => {
    setEditingEquipe(equipe);
    setFormData({
      nom: equipe.nom,
      description: equipe.description || '',
      agents: equipe.agents?.map(a => a.id) || [],
      horaires: equipe.horaires || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      agents: [],
      horaires: []
    });
    setEditingEquipe(null);
  };

  return {
    equipes,
    loadingEquipes,
    showModal,
    setShowModal,
    editingEquipe,
    formData,
    setFormData,
    loadEquipes,
    handleCreate,
    handleUpdate,
    handleDelete,
    openEditModal,
    resetForm
  };
}
