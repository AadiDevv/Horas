"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
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
    loadEquipes();
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* Main Content */}
          <main className="flex-1 p-8">
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <DashboardStatCard
                    title="Taux de présence (%)"
                    value={"98"}
                    icon={Users}
                  />
                  <DashboardStatCard
                    title="Taux de retard (%)"
                    icon={Users}
                    value={"4"}
                  />
                  <DashboardStatCard
                    title="Moyenne d'heures / jour (h)"
                    value={"7.06"}
                    icon={Users}
                  />
                  <DashboardStatCard
                    title="Heures supplémentaires (h)"
                    icon={Users}
                    value="10"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap -6">
                  <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                      Agents récents
                    </h3>
                    <div className="space-y-3">
                      {agents.slice(0, 5).map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold">
                              {agent.prenom[0]}
                              {agent.nom[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {agent.prenom} {agent.nom}
                              </p>
                              <p className="text-sm text-gray-600">
                                {agent.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              agent.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {agent.isActive ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                      Équipes
                    </h3>
                    <div className="space-y-3">
                      {equipes.slice(0, 5).map((equipe) => (
                        <div
                          key={equipe.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">
                              <Users size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {equipe.nom}
                              </p>
                              <p className="text-sm text-gray-600">
                                {equipe.description || "Aucune description"}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                            {equipe.agentCount} membres
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* AGENTS PAGE */}
            {currentPage === "agents" && (
              <AgentList
                agents={filteredAgents}
                onAddAgent={openAgentModal}
                onEditAgent={openEditAgentModal}
                onDeleteAgent={handleDeleteAgent}
              />
            )}

            {/* ÉQUIPES PAGE */}
            {currentPage === "equipes" && (
              <EquipeList
                equipes={equipes}
                onAddEquipe={openEquipeModal}
                onEditEquipe={openEditEquipeModal}
                onDeleteEquipe={handleDeleteEquipe}
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
          equipes={equipes}
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
