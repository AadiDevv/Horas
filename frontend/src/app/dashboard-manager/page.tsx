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
  AbsencesCard,
  AbsencesWeekChart,
  ScheduleList,
  ScheduleModal,
} from "./components";
import {
  useManagerDashboard,
  useAgentManager,
  useEquipeManager,
} from "./hooks/useManagerDashboard";
import { useManagerSettings } from "./hooks/useManagerSettings";
import { useManagerStats } from "./hooks/useManagerStats";
import * as api from "./services/apiService";
import { useScheduleManager } from "./hooks/useScheduleManager";

function ManagerDashboard() {
  const { currentPage, setCurrentPage, formattedDate } = useManagerDashboard();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const {
    schedules,
    loadingSchedules,
    showModal: showScheduleModal,
    setShowModal: setShowScheduleModal,
    editingSchedule,
    formData: scheduleFormData,
    setFormData: setScheduleFormData,
    loadSchedules,
    handleCreate: handleCreateSchedule,
    handleUpdate: handleUpdateSchedule,
    handleDelete: handleDeleteSchedule,
    openEditModal: openEditScheduleModal,
    resetForm: resetScheduleForm,
  } = useScheduleManager();

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAgents();
    loadSchedules();
  }, []);

  useEffect(() => {
    if (agents.length >= 0) {
      loadEquipes();
    }
  }, [agents]);

  const enrichedEquipes = equipes.map((equipe) => {
    const agentsInTeam = agents.filter((agent) => agent.equipeId === equipe.id);
    return {
      ...equipe,
      agentCount: agentsInTeam.length,
      agents: agentsInTeam,
    };
  });

  const {
    stats,
    loading: statsLoading,
    refreshStats,
  } = useManagerStats(agents, enrichedEquipes);

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

  const handleScheduleSubmit = () => {
    if (editingSchedule) {
      handleUpdateSchedule();
    } else {
      handleCreateSchedule();
    }
  };

  const openScheduleModal = () => {
    resetScheduleForm();
    setShowScheduleModal(true);
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

        <div className="flex flex-1 overflow-hidden relative">
          <div className="hidden lg:block h-full">
            <Sidebar
              isOpen={sidebarOpen}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

          <div
            className={`lg:hidden fixed inset-y-0 left-0 z-40 h-full transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <Sidebar
              isOpen={true}
              currentPage={currentPage}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false);
              }}
            />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
            {currentPage === "dashboard" && (
              <>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-10 gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Aujourd'hui
                    </h2>
                    <p className="text-gray-600 font-medium">{formattedDate}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                      onClick={openEquipeModal}
                      className="flex-1 sm:flex-none justify-center flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow cursor-pointer active:scale-95"
                    >
                      <Users size={20} strokeWidth={2} />
                      Créer une équipe
                    </button>
                    <button
                      onClick={openAgentModal}
                      className="flex-1 sm:flex-none justify-center flex items-center gap-3 px-6 py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-black/20 cursor-pointer active:scale-95"
                    >
                      <UserPlus size={20} strokeWidth={2} />
                      Ajouter un agent
                    </button>
                  </div>
                </div>

                {/* KPIs en haut */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                    value={stats.retardsAujourdhui.toString()}
                    subtitle={
                      stats.retardsAujourdhui === 0
                        ? "Aucun retard"
                        : `${stats.retardsAujourdhui} retard${stats.retardsAujourdhui > 1 ? "s" : ""} aujourd'hui`
                    }
                    icon={Clock}
                  />
                </div>

                {/* Section graphiques - Données réelles */}
                {enrichedEquipes.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <HeuresChart equipes={stats.heuresParEquipe} />
                    <AbsencesCard
                      absences={stats.absencesDetail}
                      absencesEnAttente={stats.absencesEnAttente}
                    />
                  </div>
                )}

                {/* Section stats absences et ponctualité - Données réelles */}
                {enrichedEquipes.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AbsencesWeekChart
                      data={stats.absencesParJour}
                      total={stats.totalAbsencesSemaine}
                      evolution={stats.evolutionAbsences}
                    />
                    <PonctualiteScore
                      equipes={stats.scoreParEquipe}
                      scoreGlobal={stats.scoreGlobal}
                      objectif={90}
                    />
                  </div>
                )}
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
                onRefresh={() => {
                  loadAgents();
                  refreshStats();
                }}
              />
            )}

            {/* HORAIRES PAGE */}
            {currentPage === "horaires" && (
              <ScheduleList
                schedules={schedules}
                onAddSchedule={openScheduleModal}
                onEditSchedule={openEditScheduleModal}
                onDeleteSchedule={handleDeleteSchedule}
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
          allEquipes={enrichedEquipes}
          onMoveAgent={async (agentId: number, newTeamId: number) => {
            // Déplacer l'agent vers la nouvelle équipe
            const result = await api.assignUserToTeam(agentId, newTeamId);
            if (result.success) {
              // Recharger les agents et équipes pour mettre à jour l'UI
              await loadAgents();
              await loadEquipes();
            }
          }}
        />

        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            resetScheduleForm();
          }}
          formData={scheduleFormData}
          setFormData={setScheduleFormData}
          schedule={editingSchedule}
          onSave={handleScheduleSubmit}
          loading={loadingSchedules}
        />
      </div>
    </RoleProtection>
  );
}

export default ManagerDashboard;
