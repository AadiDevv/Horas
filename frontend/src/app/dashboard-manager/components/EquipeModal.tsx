import { X, Loader2 } from 'lucide-react';
import { Equipe, EquipeFormData } from '../types';

interface EquipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipe: Equipe | null;
  formData: EquipeFormData;
  setFormData: (data: EquipeFormData) => void;
  onSave: () => void;
  loading: boolean;
}

export default function EquipeModal({
  isOpen,
  onClose,
  equipe,
  formData,
  setFormData,
  onSave,
  loading
}: EquipeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {equipe ? "Modifier l'équipe" : 'Nouvelle Équipe'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nom de l'équipe</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <button
            onClick={onSave}
            disabled={loading}
            className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {equipe ? 'Modification...' : 'Création...'}
              </>
            ) : (
              equipe ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
