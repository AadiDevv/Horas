"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, UserCheck, Clock } from "lucide-react";
import Navbar from "../components/navbar";
import RoleProtection from "../middleware/roleProtection";
import {
  DashboardStatCard,
  Sidebar,
  AgentModal,
  EquipeModal,
  AgentList,
  EquipeList,
  SettingsModal,
  KpiCard,
  RetardsCard,
  HeuresChart,
  RetardsWeekChart,
  PonctualiteScore,
  PointagesManagement,
} from "./components";
import {
  useManagerDashboard,
  useAgentManager,
  useEquipeManager,
} from "./hooks/useManagerDashboard";
import { useManagerSettings } from "./hooks/useManagerSettings";

// ==================== MAIN COMPONENT ====================
function ManagerDashboard() {
  // Custom hooks for state management
  const { currentPage, setCurrentPage, formattedDate } = useManagerDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Settings hook
  const {
    userData,
    formData,
    setFormData,
    settingsOpen,
    setSettingsOpen,
    saving,
    successMessage,
    errorMessage,
    handleOpenSettings,
    handleSaveSettings,
  } = useManagerSettings();

  const {
    agents,
    filteredAgents,
    loadingAgents,
    showModal: showAgentModal,
    setShowModal: setShowAgentModal,
    editingAgent,
    formData: agentFormData,
    setFormData: setAgentFormData,
    loadAgents,
    handleCreate: handleCreateAgent,
    handleUpdate: handleUpdateAgent,
    handleDelete: handleDeleteAgent,
    openEditModal: openEditAgentModal,
    resetForm: resetAgentForm,
  } = useAgentManager();

  const {
    equipes,
    loadingEquipes,
    showModal: showEquipeModal,
    setShowModal: setShowEquipeModal,
    editingEquipe,
    formData: equipeFormData,
    setFormData: setEquipeFormData,
    loadEquipes,
    handleCreate: handleCreateEquipe,
    handleUpdate: handleUpdateEquipe,
    handleDelete: handleDeleteEquipe,
    openEditModal: openEditEquipeModal,
    resetForm: resetEquipeForm,
  } = useEquipeManager();

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAgents();
  }, []);

  // Recharger les équipes quand les agents changent (pour mettre à jour agentCount)
  useEffect(() => {
    if (agents.length >= 0) {
      loadEquipes();
    }
  }, [agents]);

  // Enrichir les équipes avec le vrai nombre d'agents
  const enrichedEquipes = equipes.map(equipe => {
    const agentsInTeam = agents.filter(agent => agent.equipeId === equipe.id);
    return {
      ...equipe,
      agentCount: agentsInTeam.length,
      agents: agentsInTeam
    };
  });

  // ==================== HANDLERS ====================
  const handleAgentSubmit = () => {
    if (editingAgent) {
      handleUpdateAgent();
    } else {
      handleCreateAgent();
    }
  };

  const handleEquipeSubmit = () => {
    if (editingEquipe) {
      handleUpdateEquipe();
    } else {
      handleCreateEquipe();
    }
  };

  const openAgentModal = () => {
    resetAgentForm();
    setShowAgentModal(true);
  };

  const openEquipeModal = () => {
    resetEquipeForm();
    setShowEquipeModal(true);
  };

  // ==================== RENDER ====================
  return (
    <RoleProtection allowedRoles={["manager", "admin"]}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Navbar
          onOpenSettings={handleOpenSettings}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Settings Modal */}
        {userData && (
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            userData={userData}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveSettings}
            saving={saving}
            successMessage={successMessage}
            errorMessage={errorMessage}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* Main Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {/* DASHBOARD PAGE */}
            {currentPage === "dashboard" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Aujourd'hui
                    </h2>
                    <p className="text-gray-600 font-medium">{formattedDate}</p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={openEquipeModal}
                      className="flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow"
                    >
                      <Users size={20} strokeWidth={2} />
                      Créer une équipe
                    </button>
                    <button
                      onClick={openAgentModal}
                      className="flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-gray-900 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-black/20"
                    >
                      <UserPlus size={20} strokeWidth={2} />
                      Ajouter un agent
                    </button>
                  </div>
                </div>

                {/* KPIs en haut */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <KpiCard
                    title="Employés en ligne"
                    value={agents.filter((a) => a.isActive).length}
                    subtitle={`sur ${agents.length} total`}
                    icon={Users}
                    showGreenDot={true}
                  />
                  <KpiCard
                    title="Taux de présence"
                    value={`${Math.round((agents.filter((a) => a.isActive).length / Math.max(agents.length, 1)) * 100)}%`}
                    subtitle={`${agents.filter((a) => a.isActive).length}/${agents.length} présents`}
                    icon={UserCheck}
                  />
                  <KpiCard
                    title="Retards aujourd'hui"
                    value="3"
                    subtitle="Retard moyen: 12 min"
                    icon={Clock}
                  />
                </div>

                {/* Section graphiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <HeuresChart
                    equipes={[
                      { nom: "Équipe A", heures: 38, objectif: 40 },
                      { nom: "Équipe B", heures: 42, objectif: 40 },
                      { nom: "Équipe C", heures: 35, objectif: 40 },
                    ]}
                  />
                  <RetardsCard
                    retards={[
                      { employeNom: "Jean Dupont", minutes: 15, heureArrivee: "9h15" },
                      { employeNom: "Marie Martin", minutes: 8, heureArrivee: "9h08" },
                      { employeNom: "Paul Durand", minutes: 12, heureArrivee: "9h12" },
                    ]}
                    retardMoyen={12}
                  />
                </div>

                {/* Section stats retards et ponctualité */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RetardsWeekChart
                    data={[
                      { jour: "Lun", count: 2 },
                      { jour: "Mar", count: 4 },
                      { jour: "Mer", count: 1 },
                      { jour: "Jeu", count: 3, isToday: true },
                      { jour: "Ven", count: 0 },
                      { jour: "Sam", count: 0 },
                      { jour: "Dim", count: 0 },
                    ]}
                    total={10}
                    evolution={-20}
                  />
                  <PonctualiteScore
                    equipes={[
                      { nom: "Équipe A", score: 94 },
                      { nom: "Équipe B", score: 87 },
                      { nom: "Équipe C", score: 78 },
                    ]}
                    scoreGlobal={86}
                    objectif={90}
                  />
                </div>
              </>
            )}

            {/* AGENTS PAGE */}
            {currentPage === "agents" && (
              <AgentList
                agents={filteredAgents}
                equipes={enrichedEquipes}
                onAddAgent={openAgentModal}
                onEditAgent={openEditAgentModal}
                onDeleteAgent={handleDeleteAgent}
              />
            )}

            {/* ÉQUIPES PAGE */}
            {currentPage === "equipes" && (
              <EquipeList
                equipes={enrichedEquipes}
                onAddEquipe={openEquipeModal}
                onEditEquipe={openEditEquipeModal}
                onDeleteEquipe={handleDeleteEquipe}
              />
            )}

            {/* POINTAGES PAGE */}
            {currentPage === "pointages" && (
              <PointagesManagement
                agents={filteredAgents}
                equipes={equipes}
                onRefresh={loadAgents}
              />
            )}
          </main>
        </div>

        {/* MODALS */}
        <AgentModal
          isOpen={showAgentModal}
          onClose={() => {
            setShowAgentModal(false);
            resetAgentForm();
          }}
          formData={agentFormData}
          setFormData={setAgentFormData}
          equipes={enrichedEquipes}
          agent={editingAgent}
          onSave={handleAgentSubmit}
          loading={loadingAgents}
        />

        <EquipeModal
          isOpen={showEquipeModal}
          onClose={() => {
            setShowEquipeModal(false);
            resetEquipeForm();
          }}
          onSave={handleEquipeSubmit}
          formData={equipeFormData}
          setFormData={setEquipeFormData}
          equipe={editingEquipe}
          loading={loadingEquipes}
          availableAgents={agents}
        />
      </div>
    </RoleProtection>
  );
}

export default ManagerDashboard;
