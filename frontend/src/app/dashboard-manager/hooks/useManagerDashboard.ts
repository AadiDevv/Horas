import { useState, useEffect } from 'react';
import { Agent, Equipe, AgentFormData, EquipeFormData, DashboardPage, Manager, ManagerFormData } from '../types';
import * as api from '../services/apiService';
import { handleApiError, showSuccess } from '@/app/utils/errorHandler';

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
    equipeId: '',
    customScheduleId: null
  });

  useEffect(() => {
    const filtered = agents.filter((agent) =>
      `${agent.prenom} ${agent.nom} ${agent.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(filtered);
  }, [searchTerm, agents]);

  const loadAgents = async () => {
    console.log('📋 Début du chargement des agents...');
    setLoadingAgents(true);
    try {
      const result = await api.getAgents();
      console.log('📋 Résultat getAgents:', result);
      if (result.success && result.data) {
        console.log('📋 Nombre d\'agents reçus:', result.data.length);
        console.log('📋 Agents:', result.data);
        setAgents(result.data);
        setFilteredAgents(result.data);
      } else {
        console.warn('⚠️ Pas de données d\'agents ou échec');
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors du chargement des agents');
    }
    setLoadingAgents(false);
    console.log('📋 Fin du chargement des agents');
  };

  const handleCreate = async () => {
    try {
      const newAgent = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        role: formData.role,
        telephone: formData.telephone || undefined,
        equipeId: formData.equipeId ? Number(formData.equipeId) : undefined,
        password: formData.password
      };
      const result = await api.createAgent(newAgent);
      if (result.success) {
        showSuccess('Agent créé avec succès');
        await loadAgents();
        setShowModal(false);
        resetForm();

      }
    } catch (error) {
      handleApiError(error, 'Erreur lors de la création de l\'agent');
    }
  };

  const handleUpdate = async () => {
    if (!editingAgent) return;
    try {

      const updates = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        role: formData.role,
        telephone: formData.telephone || undefined
      };
      const result = await api.updateAgent(editingAgent.id, updates);
      if (result.success) {

        const newTeamId = formData.equipeId ? Number(formData.equipeId) : null;
        const oldTeamId = editingAgent.equipeId || null;

        if (newTeamId !== oldTeamId) {
          console.log('🔄 Changement d\'équipe détecté:', { oldTeamId, newTeamId });

          if (newTeamId) {

            console.log('➕ Assignation à l\'équipe', newTeamId);
            await api.assignUserToTeam(editingAgent.id, newTeamId);
            showSuccess('Agent mis à jour avec succès');
          } else {

            console.warn('⚠️ Le backend ne supporte pas le retrait d\'une équipe. L\'agent reste dans son équipe actuelle.');
            handleApiError(
              new Error('Le retrait d\'une équipe n\'est pas supporté. Veuillez assigner l\'agent à une autre équipe si nécessaire.'),
              'Impossible de retirer l\'agent de son équipe'
            );

            await loadAgents();
            setShowModal(false);
            setEditingAgent(null);
            resetForm();
            return;
          }
        } else {
          showSuccess('Agent mis à jour avec succès');
        }

        await loadAgents();
        setShowModal(false);
        setEditingAgent(null);
        resetForm();
      }
    } catch (error) {

      console.log('Erreur gérée par apiClient:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;
    try {
      const result = await api.deleteAgent(id);
      if (result.success) {
        showSuccess('Agent supprimé avec succès');
        await loadAgents();
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors de la suppression de l\'agent');
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
      equipeId: agent.equipeId?.toString() || '',
      customScheduleId: agent.scheduleId || null
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
      equipeId: '',
      customScheduleId: null
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
    scheduleId: undefined
  });

  const loadEquipes = async () => {
    setLoadingEquipes(true);
    try {
      const result = await api.getEquipes();
      if (result.success && result.data) {
        setEquipes(result.data);
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors du chargement des équipes');
    }
    setLoadingEquipes(false);
  };

  const handleCreate = async () => {
    try {
      const newEquipe = {
        nom: formData.nom,
        description: formData.description || undefined,
        agents: formData.agents,
        scheduleId: formData.scheduleId
      };
      const result = await api.createEquipe(newEquipe);
      if (result.success) {

        if (formData.agents.length > 0 && result.data) {
          console.log('🔄 Assignation des agents à l\'équipe', result.data.id);
          for (const agentId of formData.agents) {
            try {
              await api.assignUserToTeam(agentId, result.data.id);
              console.log('✅ Agent', agentId, 'assigné à l\'équipe', result.data.id);
            } catch (error) {
              handleApiError(error, `Erreur lors de l'assignation de l'agent ${agentId}`);
            }
          }
        }

        if (formData.scheduleId && result.data) {
          console.log('⏰ Assignation du schedule', formData.scheduleId, 'à l\'équipe', result.data.id);
          try {
            await api.assignScheduleToTeam(result.data.id, formData.scheduleId);
            console.log('✅ Schedule assigné avec succès');
          } catch (error) {
            handleApiError(error, 'Erreur lors de l\'assignation du schedule');
          }
        }

        showSuccess('Équipe créée avec succès');
        await loadEquipes();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors de la création de l\'équipe');
    }
  };

  const handleUpdate = async () => {
    if (!editingEquipe) return;

    try {
      const updates = {
        nom: formData.nom,
        description: formData.description || undefined,
        agents: formData.agents,
        scheduleId: formData.scheduleId
      };
      const result = await api.updateEquipe(editingEquipe.id, updates);
      if (result.success) {

        const currentAgentIds = editingEquipe.agents?.map(a => a.id) || [];
        const newAgentIds = formData.agents.filter(id => !currentAgentIds.includes(id));

        if (newAgentIds.length > 0) {
          console.log('🔄 Assignation des nouveaux agents à l\'équipe', editingEquipe.id);
          console.log('📋 Agents déjà dans l\'équipe:', currentAgentIds);
          console.log('➕ Nouveaux agents à assigner:', newAgentIds);

          for (const agentId of newAgentIds) {
            try {
              await api.assignUserToTeam(agentId, editingEquipe.id);
              console.log('✅ Agent', agentId, 'assigné à l\'équipe', editingEquipe.id);
            } catch (error) {
              handleApiError(error, `Erreur lors de l'assignation de l'agent ${agentId}`);
            }
          }
        } else {
          console.log('ℹ️ Aucun nouvel agent à assigner');
        }

        if (formData.scheduleId !== editingEquipe.scheduleId) {
          console.log('⏰ Changement de schedule détecté');
          console.log('Ancien:', editingEquipe.scheduleId, '→ Nouveau:', formData.scheduleId);

          if (formData.scheduleId) {
            try {
              await api.assignScheduleToTeam(editingEquipe.id, formData.scheduleId);
              console.log('✅ Schedule mis à jour avec succès');
            } catch (error) {
              handleApiError(error, 'Erreur lors de l\'assignation du schedule');
            }
          }
        }

        showSuccess('Équipe mise à jour avec succès');
        await loadEquipes();
        setShowModal(false);
        setEditingEquipe(null);
        resetForm();
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors de la mise à jour de l\'équipe');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    try {
      const result = await api.deleteEquipe(id);
      if (result.success) {
        showSuccess('Équipe supprimée avec succès');
        await loadEquipes();
      }
    } catch (error) {
      handleApiError(error, 'Erreur lors de la suppression de l\'équipe');
    }
  };

  const openEditModal = async (equipe: Equipe) => {
    setEditingEquipe(equipe);

    setFormData({
      nom: equipe.nom,
      description: equipe.description || '',
      agents: equipe.agents?.map(a => a.id) || [],
      scheduleId: equipe.scheduleId || undefined
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      agents: [],
      scheduleId: undefined
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
