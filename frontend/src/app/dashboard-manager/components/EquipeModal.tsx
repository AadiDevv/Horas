import { X, Loader2, Plus, Clock, Trash2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Equipe, EquipeFormData, Agent, Schedule } from "../types";

interface EquipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipe: Equipe | null;
  formData: EquipeFormData;
  setFormData: (data: EquipeFormData) => void;
  onSave: () => void;
  loading: boolean;
  availableAgents?: Agent[];
  allEquipes?: Equipe[];
  availableSchedules?: Schedule[];
  onMoveAgent?: (agentId: number, newTeamId: number) => Promise<void>;
}

export default function EquipeModal({
  isOpen,
  onClose,
  equipe,
  formData,
  setFormData,
  onSave,
  loading,
  availableAgents = [],
  allEquipes = [],
  availableSchedules = [],
  onMoveAgent,
}: EquipeModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "agents" | "horaires">(
    "info",
  );
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [movingAgent, setMovingAgent] = useState<number | null>(null);

  if (!isOpen) return null;

  const addAgent = () => {
    if (selectedAgent && !formData.agents.includes(selectedAgent)) {
      setFormData({
        ...formData,
        agents: [...formData.agents, selectedAgent],
      });
      setSelectedAgent(null);
    }
  };

  const handleMoveAgent = async (agentId: number, newTeamId: number) => {
    if (!onMoveAgent) return;

    setMovingAgent(agentId);
    try {
      await onMoveAgent(agentId, newTeamId);

      setFormData({
        ...formData,
        agents: formData.agents.filter((id) => id !== agentId),
      });
    } catch (error) {
      console.error("Erreur lors du déplacement de l'agent:", error);
    } finally {
      setMovingAgent(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {equipe ? "Gérer l'équipe" : "Nouvelle Équipe"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "info"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "agents"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agents ({formData.agents.length})
          </button>
          <button
            onClick={() => setActiveTab("horaires")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "horaires"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Horaire {formData.scheduleId ? '(1)' : '(0)'}
          </button>
        </div>

        <div className="space-y-4 min-h-[400px]">
          {activeTab === "info" && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nom de l&apos;équipe
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ex: Équipe Support"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="Décrivez le rôle de cette équipe..."
                />
              </div>
            </>
          )}

          {activeTab === "agents" && (
            <div>
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedAgent || ""}
                  onChange={(e) => setSelectedAgent(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Sélectionner un agent</option>
                  {availableAgents
                    .filter((agent) => !formData.agents.includes(agent.id))
                    .map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.prenom} {agent.nom} ({agent.email})
                      </option>
                    ))}
                </select>
                <button
                  onClick={addAgent}
                  disabled={!selectedAgent}
                  className="px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={18} />
                  Ajouter
                </button>
              </div>

              <div className="space-y-2">
                {formData.agents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun agent dans cette équipe
                  </div>
                ) : (
                  formData.agents.map((agentId) => {
                    const agent = availableAgents.find((a) => a.id === agentId);
                    if (!agent) return null;
                    const otherEquipes = allEquipes.filter(
                      (e) => e.id !== equipe?.id,
                    );
                    const isMoving = movingAgent === agentId;

                    return (
                      <div
                        key={agentId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium">
                            {agent.prenom} {agent.nom}
                          </p>
                          <p className="text-sm text-gray-600">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft size={16} className="text-gray-400" />
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleMoveAgent(
                                  agentId,
                                  Number(e.target.value),
                                );
                              }
                            }}
                            disabled={isMoving || otherEquipes.length === 0}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {isMoving
                                ? "Déplacement..."
                                : otherEquipes.length === 0
                                  ? "Aucune autre équipe"
                                  : "Déplacer vers..."}
                            </option>
                            {otherEquipes.map((eq) => (
                              <option key={eq.id} value={eq.id}>
                                {eq.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "horaires" && (
            <div className="space-y-4">
              {/* Dropdown de sélection */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Horaire de l&apos;équipe
                </label>
                <select
                  value={formData.scheduleId || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    scheduleId: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">Aucun horaire assigné</option>
                  {availableSchedules?.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name} • {schedule.startHour} - {schedule.endHour}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview du schedule sélectionné */}
              {formData.scheduleId && (() => {
                const selectedSchedule = availableSchedules?.find(s => s.id === formData.scheduleId);
                if (!selectedSchedule) return null;

                const dayNames: { [key: number]: string } = {
                  1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu',
                  5: 'Ven', 6: 'Sam', 7: 'Dim'
                };

                return (
                  <div className="mt-4 p-5 bg-gray-50 rounded-xl border border-gray-200">

                       {/* Nom */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Nom</p>
                        <p className="font-medium">{selectedSchedule.name}</p>
                      </div>

                      {/* Heures */}
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Horaires</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{selectedSchedule.startHour}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium">{selectedSchedule.endHour}</span>
                        </div>
                      </div>

                      {/* Jours actifs */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Jours actifs</p>
                        <div className="flex flex-wrap gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const isActive = selectedSchedule.activeDays.includes(day);
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

              {/* Lien vers la gestion des horaires */}
              {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800">
                  💡 Pour créer ou modifier des horaires, utilisez l&apos;onglet <strong>&quot;Horaires&quot;</strong> dans le menu de gauche.
                </p>
              </div> */}
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={loading}
          className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {equipe ? "Sauvegarde..." : "Création..."}
            </>
          ) : equipe ? (
            "Sauvegarder les modifications"
          ) : (
            "Créer l'équipe"
          )}
        </button>
      </div>
    </div>
  );
}
