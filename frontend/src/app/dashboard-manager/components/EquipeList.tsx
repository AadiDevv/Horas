import { Users, Edit2, Trash2 } from 'lucide-react';
import { Equipe } from '../types';

interface EquipeListProps {
  equipes: Equipe[];
  onAddEquipe: () => void;
  onEditEquipe: (equipe: Equipe) => void;
  onDeleteEquipe: (id: number) => void;
}

export default function EquipeList({ equipes, onAddEquipe, onEditEquipe, onDeleteEquipe }: EquipeListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold">Gestion des Équipes</h2>
        <button
          onClick={onAddEquipe}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all"
        >
          <Users size={20} />
          Créer une équipe
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {equipes.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center text-gray-500">
            <p>Aucune équipe pour le moment</p>
            <button
              onClick={onAddEquipe}
              className="mt-4 text-black hover:underline font-medium"
            >
              Créer votre première équipe
            </button>
          </div>
        ) : (
          equipes.map((equipe) => (
            <div key={equipe.id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{equipe.nom}</h3>
                  <p className="text-sm text-gray-600 mb-4">{equipe.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{equipe.agentCount} agents</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditEquipe(equipe)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteEquipe(equipe.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
