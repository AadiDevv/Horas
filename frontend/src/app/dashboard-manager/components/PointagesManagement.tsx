import { useState, useEffect } from 'react';
import { Search, Calendar, Edit2, Trash2, Plus, Clock } from 'lucide-react';
import { Agent, Equipe } from '../types';
import {
  getEmployeeWeekTimesheets,
  Timesheet,
  updateTimesheet,
  deleteTimesheet,
  createTimesheet
} from '../services/timesheetService';
import WeeklyTimeline from './WeeklyTimeline';
import BlockModal, { BlockData } from './BlockModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { getEquipeName } from './AgentList';

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
  const [loading, setLoading] = useState(false);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingPair, setEditingPair] = useState<{ entry: Timesheet; exit?: Timesheet } | null>(null);
  const [createDate, setCreateDate] = useState<string>('');
  const [createStartTime, setCreateStartTime] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPair, setDeletingPair] = useState<{ entry: Timesheet; exit?: Timesheet } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtrer les agents par recherche
  const filteredAgents = agents.filter(agent =>
    `${agent.prenom} ${agent.nom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer le lundi de la semaine sélectionnée
  const getMonday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Si dimanche (0), -6 jours, sinon 1 - jour actuel
    d.setDate(d.getDate() + diff);
    return d;
  };

  const monday = getMonday(selectedWeek);

  // Générer les 7 jours de la semaine (Lun à Dim)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    day.setHours(0, 0, 0, 0);
    return day;
  });

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

  // Charger les timesheets quand l'agent ou la semaine change
  useEffect(() => {
    if (!selectedAgent) {
      setTimesheets([]);
      return;
    }

    loadTimesheets();
  }, [selectedAgent, selectedWeek]);

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
    setCreateDate(date.toISOString().split('T')[0]);
    setCreateStartTime(hour);
    setShowModal(true);
  };

  const handleSaveBlock = async (data: BlockData) => {
    // Créer les timestamps complets pour l'entrée et la sortie
    const entryTimestamp = new Date(`${data.date}T${data.startTime}:00`).toISOString();
    const exitTimestamp = new Date(`${data.date}T${data.endTime}:00`).toISOString();

    if (data.entryId && data.exitId) {
      // Mode édition - Stratégie: supprimer les anciens et recréer

      // 1. Supprimer les anciens timesheets
      const deleteEntryResponse = await deleteTimesheet(data.entryId);
      if (!deleteEntryResponse.success) {
        throw new Error(deleteEntryResponse.error || 'Erreur lors de la suppression de l\'entrée');
      }

      const deleteExitResponse = await deleteTimesheet(data.exitId);
      if (!deleteExitResponse.success) {
        throw new Error(deleteExitResponse.error || 'Erreur lors de la suppression de la sortie');
      }

      // 2. Recréer les nouveaux timesheets avec les nouveaux timestamps
      // clockin est auto-déterminé par le backend
      const entryResponse = await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: data.status
      });

      if (!entryResponse.success) {
        throw new Error(entryResponse.error || 'Erreur lors de la recréation de l\'entrée');
      }

      const exitResponse = await createTimesheet({
        employeId: data.employeId,
        timestamp: exitTimestamp,
        status: data.status
      });

      if (!exitResponse.success) {
        throw new Error(exitResponse.error || 'Erreur lors de la recréation de la sortie');
      }
    } else {
      // Mode création - créer une paire entrée/sortie
      // clockin est auto-déterminé par le backend (inverse du dernier)
      const entryResponse = await createTimesheet({
        employeId: data.employeId,
        timestamp: entryTimestamp,
        status: data.status
      });

      if (!entryResponse.success) {
        throw new Error(entryResponse.error || 'Erreur lors de la création de l\'entrée');
      }

      const exitResponse = await createTimesheet({
        employeId: data.employeId,
        timestamp: exitTimestamp,
        status: data.status
      });

      if (!exitResponse.success) {
        throw new Error(exitResponse.error || 'Erreur lors de la création de la sortie');
      }
    }

    await loadTimesheets();
  };

  const handleConfirmDelete = async () => {
    if (!deletingPair) return;

    setDeleting(true);
    try {
      // Supprimer l'entrée
      const entryResponse = await deleteTimesheet(deletingPair.entry.id);
      if (!entryResponse.success) {
        throw new Error(entryResponse.error || 'Erreur lors de la suppression de l\'entrée');
      }

      // Supprimer la sortie si elle existe
      if (deletingPair.exit) {
        const exitResponse = await deleteTimesheet(deletingPair.exit.id);
        if (!exitResponse.success) {
          throw new Error(exitResponse.error || 'Erreur lors de la suppression de la sortie');
        }
      }

      // Recharger les timesheets
      await loadTimesheets();
      setShowDeleteModal(false);
      setDeletingPair(null);
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert((error as Error).message);
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-semibold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Gestion des Pointages
          </h2>
          <p className="text-gray-600">Ajustez les pointages de vos agents</p>
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
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selectedAgent?.id === agent.id
                    ? 'bg-black text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="font-semibold">{agent.prenom} {agent.nom}</div>
                <div className={`text-sm ${selectedAgent?.id === agent.id ? 'text-gray-300' : 'text-gray-500'}`}>
                  {getEquipeName(equipes, agent.equipeId) || 'Sans équipe'}
                </div>
              </button>
            ))}
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
                    Aujourd'hui
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
                <WeeklyTimeline
                  timesheets={timesheets}
                  weekDays={weekDays}
                  onEditPair={handleEditPair}
                  onDelete={handleDelete}
                  onCreate={handleCreate}
                />
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
            entryTimesheet={editingPair?.entry}
            exitTimesheet={editingPair?.exit}
            employeeId={selectedAgent.id}
            employeeName={`${selectedAgent.prenom} ${selectedAgent.nom}`}
            initialDate={createDate}
            initialStartTime={createStartTime}
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
