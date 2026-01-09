import { useState, useEffect } from "react";
import { Search, Calendar, Edit2, Trash2, Clock, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Agent, Equipe } from "../types";
import LoadingLogo from "@/app/components/LoadingLogo";
import {
  getEmployeeWeekTimesheets,
  Timesheet,
  updateTimesheet,
  updateTimesheetPair,
  deleteTimesheet,
  createTimesheet,
} from "../services/timesheetService";
import {
  getPendingAbsences,
  getAbsences,
  Absence,
  validateAbsence,
  createAbsence,
  deleteAbsence,
} from "../services/absenceService";
import { getUserSchedule } from "@/app/dashboard-agent/services/equipeService";
import WeeklyTimeline from "./WeeklyTimeline";
import BlockModal, { BlockData } from "./BlockModal";
import AbsenceModal, { AbsenceFormData } from "./AbsenceModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getEquipeName } from "./AgentList";
import {
  getWeekDays,
  getMonday as getUtilMonday,
  formatDateLocal,
  formatDateTimeUTC,
} from "@/app/utils/dateUtils";

interface Horaire {
  id?: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

interface PointagesManagementProps {
  agents: Agent[];
  equipes: Equipe[];
  onRefresh: () => void;
}

export default function PointagesManagement({
  agents,
  equipes,
  onRefresh,
}: PointagesManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [teamSchedule, setTeamSchedule] = useState<Horaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingAbsencesCount, setPendingAbsencesCount] = useState(0);
  const [pendingAbsencesByAgent, setPendingAbsencesByAgent] = useState<
    Record<number, number>
  >({});

  const [showModal, setShowModal] = useState(false);
  const [editingPair, setEditingPair] = useState<{
    entry: Timesheet;
    exit?: Timesheet;
  } | null>(null);
  const [createDate, setCreateDate] = useState<string>("");
  const [createStartTime, setCreateStartTime] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPair, setDeletingPair] = useState<{
    entry: Timesheet;
    exit?: Timesheet;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const filteredAgents = agents.filter((agent) =>
    `${agent.prenom} ${agent.nom}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const monday = getUtilMonday(selectedWeek);
  const weekDays = getWeekDays(selectedWeek);

  const formatWeekRange = () => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const selectedMonday = getUtilMonday(selectedWeek);
    const currentMonday = getUtilMonday(today);
    return selectedMonday.toDateString() === currentMonday.toDateString();
  };

  const formatWeekButtonText = () => {
    if (isCurrentWeek()) {
      return "Cette semaine";
    }
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `Semaine du ${monday.getDate()}/${monday.getMonth() + 1} au ${sunday.getDate()}/${sunday.getMonth() + 1}`;
  };

  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const currentWeek = () => {
    setSelectedWeek(new Date());
  };

  useEffect(() => {
    if (agents.length > 0) {
      loadPendingAbsences();
    }
  }, [agents.length]);

  useEffect(() => {
    if (!selectedAgent) {
      setTimesheets([]);
      setAbsences([]);
      setTeamSchedule([]);
      return;
    }

    loadTimesheets();
    loadAbsences();
    loadTeamSchedule();
  }, [selectedAgent, selectedWeek]);

  const loadPendingAbsences = async () => {
    try {
      const response = await getPendingAbsences();
      if (response.success && response.data) {
        const activeAgentIds = agents.map((a) => a.id);
        const filteredAbsences = response.data.filter((absence) =>
          activeAgentIds.includes(absence.employeId),
        );

        console.log("📊 Absences en attente:", {
          total: response.data.length,
          filtered: filteredAbsences.length,
          activeAgents: activeAgentIds.length,
        });

        setPendingAbsencesCount(filteredAbsences.length);

        const byAgent: Record<number, number> = {};
        filteredAbsences.forEach((absence) => {
          if (absence.employeId) {
            byAgent[absence.employeId] = (byAgent[absence.employeId] || 0) + 1;
          }
        });
        setPendingAbsencesByAgent(byAgent);
      }
    } catch (error) {
      console.error("❌ Erreur chargement absences en attente:", error);
    }
  };

  const loadTimesheets = async () => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await getEmployeeWeekTimesheets(
        selectedAgent.id,
        monday,
      );
      if (response.success && response.data) {
        const mappedTimesheets = response.data.map((ts) => ({
          ...ts,
          status: ts.status === "delay" ? "retard" : ts.status,
        })) as any[];
        setTimesheets(mappedTimesheets);
      }
    } catch (error) {
      console.error("❌ Erreur chargement timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAbsences = async () => {
    if (!selectedAgent) return;

    try {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const response = await getAbsences({
        employeId: selectedAgent.id,
        startDate: formatDateLocal(monday),
        endDate: formatDateLocal(sunday),
      });

      if (response.success && response.data) {
        setAbsences(response.data);
      }
    } catch (error) {
      console.error("❌ Erreur chargement absences:", error);
    }
  };

  const loadTeamSchedule = async () => {
    if (!selectedAgent?.equipeId) {
      setTeamSchedule([]);
      return;
    }

    try {
      const response = await getUserSchedule(selectedAgent.id);
      if (response.success && response.data) {
        setTeamSchedule(response.data);
      } else {
        setTeamSchedule([]);
      }
    } catch (error) {
      console.error("❌ Erreur chargement horaires équipe:", error);
      setTeamSchedule([]);
    }
  };

  const handleEditPair = (entry: Timesheet, exit?: Timesheet) => {
    setEditingPair({ entry, exit });
    setShowModal(true);
  };

  const handleDelete = (entry: Timesheet, exit?: Timesheet) => {
    setDeletingPair({ entry, exit });
    setShowDeleteModal(true);
  };

  const handleCreate = (date: Date, hour: string) => {
    setEditingPair(null);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setCreateDate(`${year}-${month}-${day}`);
    setCreateStartTime(hour);
    setShowModal(true);
  };

  const handleSaveBlock = async (data: BlockData) => {
    // Utiliser formatDateTimeUTC pour convertir l'heure locale en UTC
    const entryTimestamp = formatDateTimeUTC(data.date, data.startTime);

    const backendStatus = data.status === "retard" ? "delay" : data.status;

    if (data.entryId && data.exitId) {
      const exitTimestamp = formatDateTimeUTC(data.date, data.endTime);
      await updateTimesheetPair({
        entryId: data.entryId,
        exitId: data.exitId,
        entryTimestamp,
        exitTimestamp,
        status: backendStatus as any,
      });
    } else if (data.mode === "single") {
      await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: backendStatus as any,
      });
    } else {
      const exitTimestamp = formatDateTimeUTC(data.date, data.endTime);
      await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: backendStatus as any,
      });

      await createTimesheet({
        employeId: data.employeId,
        timestamp: exitTimestamp,
        status: backendStatus as any,
      });
    }

    await loadTimesheets();

    onRefresh();
  };

  const handleConfirmDelete = async () => {
    if (!deletingPair) return;

    setDeleting(true);
    try {
      await deleteTimesheet(deletingPair.entry.id);

      if (deletingPair.exit) {
        await deleteTimesheet(deletingPair.exit.id);
      }

      await loadTimesheets();

      onRefresh();
      setShowDeleteModal(false);
      setDeletingPair(null);
    } catch (error) {
      console.log("Erreur gérée par apiClient:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateAbsence = () => {
    setEditingAbsence(null);
    setShowAbsenceModal(true);
  };

  const handleEditAbsence = (absence: Absence) => {
    setEditingAbsence(absence);
    setShowAbsenceModal(true);
  };

  const handleSaveAbsence = async (data: AbsenceFormData) => {
    try {
      if (data.id) {
        await validateAbsence(
          data.id,
          data.status as "approuve" | "refuse",
          data.comments,
        );
      } else {
        await createAbsence({
          employeId: data.employeId,
          type: data.type,
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          comments: data.comments,
        });
      }

      await loadAbsences();
      await loadPendingAbsences();

      onRefresh();
      setShowAbsenceModal(false);
    } catch (error) {
      console.error("Erreur sauvegarde absence:", error);
      throw error;
    }
  };

  const handleDeleteAbsence = async (id: number) => {
    try {
      const result = await deleteAbsence(id);
      if (result.success) {
        await loadAbsences();
        await loadPendingAbsences();
        onRefresh();
        setShowAbsenceModal(false);
      } else {
        throw new Error(result.error || 'Erreur de suppression');
      }
    } catch (error) {
      console.error("Erreur suppression absence:", error);
      throw error;
    }
  };

  const handleSaveAbsenceFromBlockModal = async (data: any) => {
    try {
      await createAbsence({
        employeId: data.employeId,
        type: data.type,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        comments: data.comments,
        status: data.status || "approuve",
      });

      await loadAbsences();
      await loadPendingAbsences();

      onRefresh();
    } catch (error) {
      console.error("Erreur sauvegarde absence:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Gestion des Pointages
          </h2>
          {pendingAbsencesCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full w-fit">
              <Bell size={14} className="text-orange-600 sm:hidden" />
              <Bell size={16} className="text-orange-600 hidden sm:block" />
              <span className="text-xs sm:text-sm font-semibold text-orange-600">
                {pendingAbsencesCount} absence
                {pendingAbsencesCount > 1 ? "s" : ""} en attente
              </span>
            </div>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Ajustez les pointages et validez les absences de vos agents
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 relative">
        {/* Sidebar des agents */}
        <motion.div
          className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-300 flex-shrink-0 ${
            sidebarCollapsed
              ? "lg:w-[96px]"
              : "lg:w-[260px]"
          }`}
        >
          {!sidebarCollapsed ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher un agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                {selectedAgent && (
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer active:scale-95"
                    title="Réduire la sidebar"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[300px] lg:max-h-[600px] overflow-y-auto">
                {filteredAgents.map((agent) => {
                  const pendingCount = pendingAbsencesByAgent[agent.id] || 0;

                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setSidebarCollapsed(true);
                      }}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all relative cursor-pointer active:scale-95 ${
                        selectedAgent?.id === agent.id
                          ? "bg-black text-white"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {agent.prenom} {agent.nom}
                          </div>
                          <div
                            className={`text-xs sm:text-sm truncate ${selectedAgent?.id === agent.id ? "text-gray-300" : "text-gray-500"}`}
                          >
                            {getEquipeName(equipes, agent.equipeId) ||
                              "Sans équipe"}
                          </div>
                        </div>
                        {pendingCount > 0 && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {pendingCount}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all cursor-pointer active:scale-95 w-full flex items-center justify-center shadow-sm"
                title="Développer la sidebar"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>
              <div className="h-px w-full bg-gray-200 my-1"></div>
              <div className="flex flex-col gap-2 w-full">
                {filteredAgents.map((agent) => {
                  const pendingCount = pendingAbsencesByAgent[agent.id] || 0;
                  const isSelected = selectedAgent?.id === agent.id;

                  return (
                    <button
                      key={agent.id}
                      onClick={() => {
                        setSelectedAgent(agent);
                        setSidebarCollapsed(true);
                      }}
                      className={`relative p-2 rounded-lg transition-all cursor-pointer active:scale-95 bg-gray-50 hover:bg-gray-100 ${
                        isSelected
                          ? "border-2 border-black"
                          : "border-2 border-transparent"
                      }`}
                      title={`${agent.prenom} ${agent.nom}`}
                    >
                      <div className="w-8 h-8 mx-auto bg-black rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {agent.prenom.charAt(0).toUpperCase()}
                        {agent.nom.charAt(0).toUpperCase()}
                      </div>
                      {pendingCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {pendingCount}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* Zone du planning */}
        <motion.div
          className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-300 lg:flex-1 lg:min-w-0`}
        >
          {selectedAgent ? (
            <>
              <div className="flex flex-col gap-4 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {selectedAgent.prenom} {selectedAgent.nom}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedAgent.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={previousWeek}
                    className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={currentWeek}
                    className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 ${
                      isCurrentWeek()
                        ? "bg-black hover:bg-gray-900 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    {formatWeekButtonText()}
                  </button>
                  <button
                    onClick={nextWeek}
                    className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar size={16} className="sm:hidden" />
                  <Calendar size={20} className="hidden sm:block" />
                  <span className="text-sm sm:text-base font-semibold">{formatWeekRange()}</span>
                </div>
              </div>

              {loading ? (
                <div className="border border-gray-200 rounded-xl p-8 text-center">
                  <div className="text-gray-400">
                    <LoadingLogo size={48} className="mx-auto mb-2" />
                    <p className="text-lg font-medium">Chargement...</p>
                  </div>
                </div>
              ) : (
                <>
                  <WeeklyTimeline
                    timesheets={timesheets}
                    absences={absences}
                    weekDays={weekDays}
                    onEditPair={handleEditPair}
                    onDelete={handleDelete}
                    onCreate={handleCreate}
                    onAbsenceClick={handleEditAbsence}
                    teamSchedule={teamSchedule}
                  />
                </>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] sm:min-h-[300px] text-gray-400">
              <div className="text-center px-4">
                <Search size={40} className="mx-auto mb-4 opacity-50 sm:hidden" />
                <Search size={48} className="mx-auto mb-4 opacity-50 hidden sm:block" />
                <p className="text-base sm:text-lg font-medium">Sélectionnez un agent</p>
                <p className="text-xs sm:text-sm">
                  Choisissez un agent dans la liste pour gérer ses pointages
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {selectedAgent && (
        <>
          <BlockModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingPair(null);
            }}
            onSave={handleSaveBlock}
            onAbsenceSave={handleSaveAbsenceFromBlockModal}
            entryTimesheet={editingPair?.entry}
            exitTimesheet={editingPair?.exit}
            employeeId={selectedAgent.id}
            employeeName={`${selectedAgent.prenom} ${selectedAgent.nom}`}
            initialDate={createDate}
            initialStartTime={createStartTime}
          />

          <AbsenceModal
            isOpen={showAbsenceModal}
            onClose={() => {
              setShowAbsenceModal(false);
              setEditingAbsence(null);
            }}
            onSave={handleSaveAbsence}
            onDelete={handleDeleteAbsence}
            absence={editingAbsence}
            employeeId={selectedAgent.id}
            employeeName={`${selectedAgent.prenom} ${selectedAgent.nom}`}
          />

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingPair(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Supprimer le bloc"
            message={
              deletingPair
                ? `Voulez-vous vraiment supprimer ce bloc${deletingPair.exit ? " (entrée + sortie)" : ""} ?`
                : ""
            }
            deleting={deleting}
          />
        </>
      )}
    </div>
  );
}
