import { Users, Trash2 } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold">Gestion des Équipes</h2>
        <button
          onClick={onAddEquipe}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-800 transition-all cursor-pointer active:scale-95"
        >
          <Users size={18} className="sm:hidden" />
          <Users size={20} className="hidden sm:block" />
          Créer une équipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {equipes.length === 0 ? (
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500">
            <p className="text-sm sm:text-base">Aucune équipe pour le moment</p>
            <button
              onClick={onAddEquipe}
              className="mt-4 text-sm sm:text-base text-black hover:underline font-medium cursor-pointer"
            >
              Créer votre première équipe
            </button>
          </div>
        ) : (
          equipes.map((equipe) => (
            <div key={equipe.id} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
              <div className="mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{equipe.nom}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                  {equipe.description || 'Aucune description'}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Users size={14} className="sm:hidden" />
                  <Users size={16} className="hidden sm:block" />
                  <span>{equipe.agentCount} agent{equipe.agentCount > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => onEditEquipe(equipe)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-black text-white rounded-lg sm:rounded-xl font-medium hover:bg-gray-800 transition-all cursor-pointer active:scale-95"
                >
                  <Users size={16} className="sm:hidden" />
                  <Users size={18} className="hidden sm:block" />
                  <span className="hidden sm:inline">Gérer équipe</span>
                  <span className="sm:hidden">Gérer</span>
                </button>
                <button
                  onClick={() => onDeleteEquipe(equipe.id)}
                  className="p-2 sm:p-2.5 bg-red-50 text-red-600 rounded-lg sm:rounded-xl hover:bg-red-100 transition-all cursor-pointer active:scale-95"
                  title="Supprimer l'équipe"
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
  );
}
