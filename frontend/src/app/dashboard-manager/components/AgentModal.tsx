import { X, Loader2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Agent, AgentFormData, Equipe, Schedule, ScheduleFormData } from "../types";
import { DAYS, getDayName, EMPLOYEE_SCHEDULE_PREFIX } from "../constants/schedule";
import * as api from "../services/apiService";
import { handleApiError, showSuccess } from "@/app/utils/errorHandler";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
  equipes: Equipe[];
  schedules: Schedule[];
  onSave: () => void;
  loading: boolean;
  onCustomScheduleAssign?: (agentId: number, scheduleId: number | null) => Promise<void>;
}

export default function AgentModal({
  isOpen,
  onClose,
  agent,
  formData,
  setFormData,
  equipes,
  schedules,
  onSave,
  loading,
  onCustomScheduleAssign,
}: AgentModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "equipe" | "horaire">("info");
  const [scheduleMode, setScheduleMode] = useState<'team' | 'custom'>('team');
  const [customScheduleData, setCustomScheduleData] = useState<ScheduleFormData>({
    name: '',
    startHour: '09:00',
    endHour: '17:00',
    activeDays: [1, 2, 3, 4, 5]
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Auto-generate schedule name when prenom/nom changes
  useEffect(() => {
    if (formData.prenom && formData.nom && scheduleMode === 'custom') {
      const sanitize = (str: string) => str.trim().replace(/\s+/g, '_');
      setCustomScheduleData(prev => ({
        ...prev,
        name: `${EMPLOYEE_SCHEDULE_PREFIX}${sanitize(formData.prenom)}_${sanitize(formData.nom)}`
      }));
    }
  }, [formData.prenom, formData.nom, scheduleMode]);

  useEffect(() => {
    const loadCustomSchedule = async () => {
      if (!isOpen) return;

      setActiveTab('info');

      const hasCustomSchedule = formData.customScheduleId !== null && formData.customScheduleId !== undefined;
      setScheduleMode(hasCustomSchedule ? 'custom' : 'team');

      if (hasCustomSchedule && formData.customScheduleId) {
        try {
          const response = await api.getScheduleById(formData.customScheduleId);
          if (response.success && response.data) {
            const scheduleData = response.data;
            setCustomScheduleData({
              name: scheduleData.name,
              startHour: scheduleData.startHour,
              endHour: scheduleData.endHour,
              activeDays: scheduleData.activeDays || []
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement du schedule personnalisé:', error);
        }
      }
    };

    loadCustomSchedule();
  }, [isOpen, formData.customScheduleId]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    setCustomScheduleData(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter(d => d !== day)
        : [...prev.activeDays, day].sort((a, b) => a - b)
    }));
  };

  const getTeamSchedule = (): Schedule | null => {
    if (!formData.equipeId) return null;
    const team = equipes.find(e => e.id === Number(formData.equipeId));
    if (!team || !team.scheduleId) return null;
    return schedules.find(s => s.id === team.scheduleId) || null;
  };

  const handleSaveWithSchedule = async () => {
    // Validation
    if (scheduleMode === 'custom') {
      if (!formData.prenom.trim() || !formData.nom.trim()) {
        handleApiError(new Error('Prénom et nom requis pour créer un horaire personnalisé'), '');
        return;
      }
      if (customScheduleData.activeDays.length === 0) {
        handleApiError(new Error('Au moins un jour actif doit être sélectionné'), '');
        return;
      }
      if (customScheduleData.startHour >= customScheduleData.endHour) {
        handleApiError(new Error('L\'heure de début doit être inférieure à l\'heure de fin'), '');
        return;
      }
    }

    try {
      setSavingSchedule(true);

      // Step 1: Save the agent
      await onSave();

      // Step 2: Handle custom schedule if agent exists (edit mode)
      if (agent && onCustomScheduleAssign) {
        if (scheduleMode === 'custom') {
          // Create the schedule
          console.log('🔄 Création du custom schedule pour', agent.id);
          const scheduleResult = await api.createSchedule(customScheduleData);

          if (scheduleResult.success && scheduleResult.data) {
            console.log('✅ Schedule créé avec ID:', scheduleResult.data.id);
            // Assign to agent
            await onCustomScheduleAssign(agent.id, scheduleResult.data.id);
          }
        } else if (scheduleMode === 'team' && agent.scheduleId) {
          // Remove custom schedule (revert to team)
          console.log('🔄 Retrait du custom schedule pour', agent.id);
          await onCustomScheduleAssign(agent.id, null);
        }
      }

      showSuccess('Agent enregistré avec succès');
      onClose();

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      handleApiError(error, 'Erreur lors de la sauvegarde de l\'agent');
    } finally {
      setSavingSchedule(false);
    }
  };

  const tabClassName = (tab: string) =>
    `px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer ${
      activeTab === tab
        ? "text-black border-b-2 border-black"
        : "text-gray-500 hover:text-gray-700"
    }`;

  const radioClassName = (isSelected: boolean) =>
    `flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
      isSelected
        ? "border-black bg-gray-50"
        : "border-gray-200 hover:border-gray-300"
    }`;

  const checkboxClassName = (isActive: boolean) =>
    `flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
      isActive
        ? "border-black bg-gray-50"
        : "border-gray-200 hover:border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-semibold">
            {agent ? "Modifier l'agent" : "Nouvel Agent"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer active:scale-95 transition-all flex-shrink-0"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={tabClassName("info")}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("equipe")}
            className={tabClassName("equipe")}
          >
            Équipe
          </button>
          <button
            onClick={() => setActiveTab("horaire")}
            className={tabClassName("horaire")}
          >
            Horaire 
          </button>
        </div>

        <div className="space-y-4 min-h-[400px]">
          {/* INFO TAB */}
          {activeTab === "info" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) =>
                    setFormData({ ...formData, telephone: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {!agent && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    required={!agent}
                    placeholder="Minimum 6 caractères"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    L&apos;agent pourra changer son mot de passe après la première
                    connexion
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="employe">Employé</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </>
          )}

          {/* EQUIPE TAB */}
          {activeTab === "equipe" && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Équipe {agent ? "(Changement possible)" : "(Optionnel)"}
              </label>
              <select
                value={formData.equipeId}
                onChange={(e) =>
                  setFormData({ ...formData, equipeId: e.target.value })
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Aucune équipe</option>
                {equipes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} ({e.agentCount} membre{e.agentCount > 1 ? "s" : ""})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {agent
                  ? "Un agent ne peut appartenir qu'à une seule équipe. Changez l'équipe ici ou retirez-le en sélectionnant \"Aucune équipe\"."
                  : "Vous pouvez assigner cet agent à une équipe maintenant ou le faire plus tard."}
              </p>
            </div>
          )}

          {/* HORAIRE TAB */}
          {activeTab === "horaire" && (
            <div className="space-y-4">
              {/* Radio Toggle: Team vs Custom */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold mb-3">Type d&apos;horaire</label>

                <label className={radioClassName(scheduleMode === 'team')}>
                  <input
                    type="radio"
                    name="scheduleMode"
                    checked={scheduleMode === 'team'}
                    onChange={() => setScheduleMode('team')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Utiliser l&apos;horaire de l&apos;équipe</span>
                </label>

                <label className={radioClassName(scheduleMode === 'custom')}>
                  <input
                    type="radio"
                    name="scheduleMode"
                    checked={scheduleMode === 'custom'}
                    onChange={() => setScheduleMode('custom')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Créer un horaire personnalisé</span>
                </label>
              </div>

              {/* Mode Team: Preview team schedule */}
              {scheduleMode === 'team' && (() => {
                const teamSchedule = getTeamSchedule();

                if (!teamSchedule) {
                  return (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-500">
                      {formData.equipeId
                        ? "L'équipe sélectionnée n'a pas d'horaire défini"
                        : "Veuillez d'abord sélectionner une équipe dans l'onglet 'Équipe'"}
                    </div>
                  );
                }

                const dayNames: { [key: number]: string } = {
                  1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu',
                  5: 'Ven', 6: 'Sam', 7: 'Dim'
                };

                return (
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    {/* Nom */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Nom</p>
                      <p className="font-medium">{teamSchedule.name}</p>
                    </div>

                    {/* Heures */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Horaires</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{teamSchedule.startHour}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{teamSchedule.endHour}</span>
                      </div>
                    </div>

                    {/* Jours actifs */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Jours actifs</p>
                      <div className="flex flex-wrap gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                          const isActive = teamSchedule.activeDays.includes(day);
                          return (
                            <span
                              key={day}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                isActive
                                  ? 'bg-stone-800/90 text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {dayNames[day]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Mode Custom: Inline creation form */}
              {scheduleMode === 'custom' && (
                <div className="space-y-4">
                  {/* Auto-generated name (readonly) */}
                  <div className="hidden">
                    <label className="block text-sm font-semibold mb-2">
                      Nom de l&apos;horaire
                    </label>
                    <input
                      type="text"
                      value={customScheduleData.name}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nom généré automatiquement : {EMPLOYEE_SCHEDULE_PREFIX}{formData.prenom}_{formData.nom}
                    </p>
                  </div>

                  {/* Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Heure début <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={customScheduleData.startHour}
                        onChange={(e) => setCustomScheduleData({ ...customScheduleData, startHour: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Heure fin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={customScheduleData.endHour}
                        onChange={(e) => setCustomScheduleData({ ...customScheduleData, endHour: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Active days */}
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Jours actifs <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DAYS.map((day) => (
                        <label
                          key={day.number}
                          className={checkboxClassName(customScheduleData.activeDays.includes(day.number))}
                        >
                          <input
                            type="checkbox"
                            checked={customScheduleData.activeDays.includes(day.number)}
                            onChange={() => toggleDay(day.number)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm font-medium">{day.name}</span>
                        </label>
                      ))}
                    </div>
                    {customScheduleData.activeDays.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        Au moins un jour doit être sélectionné
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveWithSchedule}
          disabled={loading || savingSchedule}
          className="w-full mt-4 sm:mt-6 py-3 text-sm sm:text-base bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {(loading || savingSchedule) ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              {agent ? 'Sauvegarde...' : 'Création...'}
            </>
          ) : (
            agent ? 'Sauvegarder les modifications' : 'Créer l\'agent'
          )}
        </button>
      </div>
    </div>
  );
}
