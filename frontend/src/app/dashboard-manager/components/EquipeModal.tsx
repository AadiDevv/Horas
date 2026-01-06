import { X, Loader2, Plus, Clock, Trash2, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Equipe, EquipeFormData, Agent, Horaire } from "../types";

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
  onMoveAgent,
}: EquipeModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "agents" | "horaires">(
    "info",
  );
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [movingAgent, setMovingAgent] = useState<number | null>(null);

  if (!isOpen) return null;

  const jours = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

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

  const addHoraire = () => {
    setFormData({
      ...formData,
      horaires: [
        ...formData.horaires,
        { jour: "Lundi", heureDebut: "09:00", heureFin: "17:00" },
      ],
    });
  };

  const updateHoraire = (
    index: number,
    field: keyof Horaire,
    value: string,
  ) => {
    const newHoraires = [...formData.horaires];
    newHoraires[index] = { ...newHoraires[index], [field]: value };
    setFormData({ ...formData, horaires: newHoraires });
  };

  const removeHoraire = (index: number) => {
    setFormData({
      ...formData,
      horaires: formData.horaires.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-semibold">
            {equipe ? "Gérer l'équipe" : "Nouvelle Équipe"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer active:scale-95 transition-all flex-shrink-0"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
        </div>

        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer ${
              activeTab === "info"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Infos
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer ${
              activeTab === "agents"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agents ({formData.agents.length})
          </button>
          <button
            onClick={() => setActiveTab("horaires")}
            className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium transition-all cursor-pointer ${
              activeTab === "horaires"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Horaires ({formData.horaires.length})
          </button>
        </div>

        <div className="space-y-4">
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
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select
                  value={selectedAgent || ""}
                  onChange={(e) => setSelectedAgent(Number(e.target.value))}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
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
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Plus size={16} className="sm:hidden" />
                  <Plus size={18} className="hidden sm:block" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-2">
                {formData.agents.length === 0 ? (
                  <div className="text-center py-8 text-sm sm:text-base text-gray-500">
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
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {agent.prenom} {agent.nom}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft size={14} className="text-gray-400 sm:hidden flex-shrink-0" />
                          <ArrowRightLeft size={16} className="text-gray-400 hidden sm:block flex-shrink-0" />
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
                            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div>
              <button
                onClick={addHoraire}
                className="mb-4 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all cursor-pointer active:scale-95"
              >
                <Clock size={16} className="sm:hidden" />
                <Clock size={18} className="hidden sm:block" />
                Ajouter un horaire
              </button>

              <div className="space-y-3">
                {formData.horaires.length === 0 ? (
                  <div className="text-center py-8 text-sm sm:text-base text-gray-500">
                    Aucun horaire défini
                  </div>
                ) : (
                  formData.horaires.map((horaire, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl"
                    >
                      <select
                        value={horaire.jour}
                        onChange={(e) =>
                          updateHoraire(index, "jour", e.target.value)
                        }
                        className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        {jours.map((jour) => (
                          <option key={jour} value={jour}>
                            {jour}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="time"
                          value={horaire.heureDebut}
                          onChange={(e) =>
                            updateHoraire(index, "heureDebut", e.target.value)
                          }
                          className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <span className="text-gray-500 text-sm sm:text-base">à</span>
                        <input
                          type="time"
                          value={horaire.heureFin}
                          onChange={(e) =>
                            updateHoraire(index, "heureFin", e.target.value)
                          }
                          className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <button
                          onClick={() => removeHoraire(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer active:scale-95 flex-shrink-0"
                        >
                          <Trash2 size={16} className="sm:hidden" />
                          <Trash2 size={18} className="hidden sm:block" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={loading}
          className="w-full mt-4 sm:mt-6 py-3 text-sm sm:text-base bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
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
