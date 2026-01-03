import { useState, useEffect } from 'react';
import { Search, Calendar, Edit2, Trash2, Clock, Bell } from 'lucide-react';
import { Agent, Equipe } from '../types';
import {
  getEmployeeWeekTimesheets,
  Timesheet,
  updateTimesheet,
  deleteTimesheet,
  createTimesheet
} from '../services/timesheetService';
import { getPendingAbsences, getAbsences, Absence, validateAbsence, createAbsence } from '../services/absenceService';
import { getEquipeHoraires } from '@/app/dashboard-agent/services/equipeService';
import WeeklyTimeline from './WeeklyTimeline';
import BlockModal, { BlockData } from './BlockModal';
import AbsenceModal, { AbsenceFormData } from './AbsenceModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getEquipeName } from './AgentList';
import { getWeekDays, getMonday as getUtilMonday, formatDateLocal } from '@/app/utils/dateUtils';

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

export default function PointagesManagement({ agents, equipes, onRefresh }: PointagesManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [teamSchedule, setTeamSchedule] = useState<Horaire[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingAbsencesCount, setPendingAbsencesCount] = useState(0);
  const [pendingAbsencesByAgent, setPendingAbsencesByAgent] = useState<Record<number, number>>({});

  // Modales Pointages
  const [showModal, setShowModal] = useState(false);
  const [editingPair, setEditingPair] = useState<{ entry: Timesheet; exit?: Timesheet } | null>(null);
  const [createDate, setCreateDate] = useState<string>('');
  const [createStartTime, setCreateStartTime] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPair, setDeletingPair] = useState<{ entry: Timesheet; exit?: Timesheet } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modales Absences
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);

  // Filtrer les agents par recherche
  const filteredAgents = agents.filter(agent =>
    `${agent.prenom} ${agent.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer le lundi et les jours de la semaine sélectionnée
  const monday = getUtilMonday(selectedWeek);
  const weekDays = getWeekDays(selectedWeek);

  const formatWeekRange = () => {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
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

  // Charger le nombre d'absences en attente au montage
  useEffect(() => {
    loadPendingAbsences();
  }, []);

  // Charger les timesheets et absences quand l'agent ou la semaine change
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
        setPendingAbsencesCount(response.data.length);

        // Grouper par agent
        const byAgent: Record<number, number> = {};
        response.data.forEach(absence => {
          if (absence.employeId) {
            byAgent[absence.employeId] = (byAgent[absence.employeId] || 0) + 1;
          }
        });
        setPendingAbsencesByAgent(byAgent);
      }
    } catch (error) {
      console.error('❌ Erreur chargement absences en attente:', error);
    }
  };

  const loadTimesheets = async () => {
    if (!selectedAgent) return;

    setLoading(true);
    try {
      const response = await getEmployeeWeekTimesheets(selectedAgent.id, monday);
      if (response.success && response.data) {
        setTimesheets(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement timesheets:', error);
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
        endDate: formatDateLocal(sunday)
      });

      if (response.success && response.data) {
        setAbsences(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement absences:', error);
    }
  };

  const loadTeamSchedule = async () => {
    if (!selectedAgent?.equipeId) {
      console.log('⚠️ Agent sans équipe, pas d\'horaires à charger');
      setTeamSchedule([]);
      return;
    }

    try {
      const response = await getEquipeHoraires(selectedAgent.equipeId);
      if (response.success && response.data) {
        setTeamSchedule(response.data);
        console.log('✅ Horaires équipe chargés:', response.data);
      } else {
        console.error('❌ Erreur chargement horaires:', response.message);
        setTeamSchedule([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement horaires équipe:', error);
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
    // Formater la date en local (YYYY-MM-DD) sans conversion UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    setCreateDate(`${year}-${month}-${day}`);
    setCreateStartTime(hour);
    setShowModal(true);
  };

  const handleSaveBlock = async (data: BlockData) => {
    // Créer les timestamps complets pour l'entrée et la sortie
    // IMPORTANT: Utiliser UTC pour éviter les décalages de timezone
    // Format: YYYY-MM-DDTHH:mm:ss.000Z (l'heure entrée par l'utilisateur est considérée comme UTC)
    const entryTimestamp = `${data.date}T${data.startTime}:00.000Z`;
    const exitTimestamp = `${data.date}T${data.endTime}:00.000Z`;

    if (data.entryId && data.exitId) {
      // Mode édition - Stratégie: supprimer les anciens et recréer
      // Les erreurs sont gérées automatiquement par apiClient (ErrorModal)
      await deleteTimesheet(data.entryId);
      await deleteTimesheet(data.exitId);

      // Recréer les nouveaux timesheets avec les nouveaux timestamps
      await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: data.status
      });

      await createTimesheet({
        employeId: data.employeId,
        timestamp: exitTimestamp,
        status: data.status
      });
    } else {
      // Mode création - créer une paire entrée/sortie
      // Les erreurs sont gérées automatiquement par apiClient (ErrorModal)
      await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: data.status
      });

      await createTimesheet({
        employeId: data.employeId,
        timestamp: exitTimestamp,
        status: data.status
      });
    }

    await loadTimesheets();
  };

  const handleConfirmDelete = async () => {
    if (!deletingPair) return;

    setDeleting(true);
    try {
      // Les erreurs sont gérées automatiquement par apiClient (ErrorModal)
      await deleteTimesheet(deletingPair.entry.id);

      // Supprimer la sortie si elle existe
      if (deletingPair.exit) {
        await deleteTimesheet(deletingPair.exit.id);
      }

      // Recharger les timesheets
      await loadTimesheets();
      setShowDeleteModal(false);
      setDeletingPair(null);
    } catch (error) {
      // L'erreur est déjà affichée par apiClient (ErrorModal)
      console.log('Erreur gérée par apiClient:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Handlers Absences
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
        // Mode édition - valider l'absence
        await validateAbsence(data.id, data.status as 'approuve' | 'refuse', data.comments);
      } else {
        // Mode création
        await createAbsence({
          employeId: data.employeId,
          type: data.type,
          startDateTime: data.startDateTime,
          endDateTime: data.endDateTime,
          comments: data.comments
        });
      }

      await loadAbsences();
      await loadPendingAbsences();
      setShowAbsenceModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde absence:', error);
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
        status: data.status || 'approuve' // Manager crée des absences approuvées par défaut
      });

      await loadAbsences();
      await loadPendingAbsences();
    } catch (error) {
      console.error('Erreur sauvegarde absence:', error);
      throw error;
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Gestion des Pointages
            </h2>
            {pendingAbsencesCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                <Bell size={16} className="text-orange-600" />
                <span className="text-sm font-semibold text-orange-600">
                  {pendingAbsencesCount} absence{pendingAbsencesCount > 1 ? 's' : ''} en attente
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">Ajustez les pointages et validez les absences de vos agents</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Liste des agents - Sidebar gauche */}
        <div className="col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredAgents.map((agent) => {
              const pendingCount = pendingAbsencesByAgent[agent.id] || 0;

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full text-left p-3 rounded-xl transition-all relative ${
                    selectedAgent?.id === agent.id
                      ? 'bg-black text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{agent.prenom} {agent.nom}</div>
                      <div className={`text-sm ${selectedAgent?.id === agent.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {getEquipeName(equipes, agent.equipeId) || 'Sans équipe'}
                      </div>
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {pendingCount}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Planning hebdomadaire - Zone principale */}
        <div className="col-span-9 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          {selectedAgent ? (
            <>
              {/* En-tête agent sélectionné */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedAgent.prenom} {selectedAgent.nom}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedAgent.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousWeek}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                  >
                    ← Précédent
                  </button>
                  <button
                    onClick={currentWeek}
                    className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Cette semaine
                  </button>
                  <button
                    onClick={nextWeek}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

              {/* Navigation semaine */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-900">
                  <Calendar size={20} />
                  <span className="font-semibold">{formatWeekRange()}</span>
                </div>
              </div>

              {/* Planning hebdomadaire */}
              {loading ? (
                <div className="border border-gray-200 rounded-xl p-8 text-center">
                  <div className="text-gray-400">
                    <Clock size={48} className="mx-auto mb-2 animate-spin" />
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
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Sélectionnez un agent</p>
                <p className="text-sm">Choisissez un agent dans la liste pour gérer ses pointages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
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
            message={deletingPair ?
              `Voulez-vous vraiment supprimer ce bloc${deletingPair.exit ? ' (entrée + sortie)' : ''} ?` :
              ''
            }
            deleting={deleting}
          />
        </>
      )}
    </div>
  );
}
