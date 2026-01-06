import { X, Loader2 } from "lucide-react";
import { Agent, AgentFormData, Equipe } from "../types";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  formData: AgentFormData;
  setFormData: (data: AgentFormData) => void;
  equipes: Equipe[];
  onSave: () => void;
  loading: boolean;
}

export default function AgentModal({
  isOpen,
  onClose,
  agent,
  formData,
  setFormData,
  equipes,
  onSave,
  loading,
}: AgentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full max-h-[95vh] overflow-y-auto">
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

        <div className="space-y-3 sm:space-y-4">
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
                L'agent pourra changer son mot de passe après la première
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

          <button
            onClick={onSave}
            disabled={loading}
            className="w-full mt-4 sm:mt-6 py-3 text-sm sm:text-base bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {agent ? "Modification..." : "Création..."}
              </>
            ) : agent ? (
              "Modifier"
            ) : (
              "Créer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
