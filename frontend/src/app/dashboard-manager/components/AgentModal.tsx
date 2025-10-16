import { X, Loader2 } from 'lucide-react';
import { Agent, AgentFormData, Equipe } from '../types';

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
  loading
}: AgentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {agent ? "Modifier l'agent" : 'Nouvel Agent'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Rôle</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="employe">Employé</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Champ équipe visible uniquement lors de la modification */}
          {agent && (
            <div>
              <label className="block text-sm font-semibold mb-2">Équipe</label>
              <select
                value={formData.equipeId}
                onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Aucune équipe</option>
                {equipes.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Changez l&apos;équipe de cet agent ou gérez les équipes depuis l&apos;onglet Équipes
              </p>
            </div>
          )}

          <button
            onClick={onSave}
            disabled={loading}
            className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {agent ? 'Modification...' : 'Création...'}
              </>
            ) : (
              agent ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
