import { UserPlus, Edit2, Trash2, Users } from 'lucide-react';
import { Agent, Equipe } from '../types';

interface AgentListProps {
  agents: Agent[];
  equipes: Equipe[];
  onAddAgent: () => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (id: number) => void;
}

export const getEquipeName = (equipes: Equipe[], equipeId?: number) => {
  if (!equipeId) return null;
  const equipe = equipes.find(e => e.id === equipeId);
  return equipe?.nom || 'Équipe inconnue';
};

export default function AgentList({ agents, equipes, onAddAgent, onEditAgent, onDeleteAgent }: AgentListProps) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold">Gestion des Agents</h2>
        <button
          onClick={onAddAgent}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-black text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-gray-800 transition-all cursor-pointer active:scale-95"
        >
          <UserPlus size={18} className="sm:hidden" />
          <UserPlus size={20} className="hidden sm:block" />
          Ajouter un agent
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-100">
        <div className="space-y-3 sm:space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm sm:text-base">Aucun agent pour le moment</p>
              <button
                onClick={onAddAgent}
                className="mt-4 text-sm sm:text-base text-black hover:underline font-medium cursor-pointer"
              >
                Créer votre premier agent
              </button>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                    {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base sm:text-lg truncate">
                      {agent.prenom} {agent.nom}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{agent.email}</p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
                      {agent.equipeId && (
                        <>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                            <Users size={12} />
                            <span className="truncate max-w-[120px] sm:max-w-none">{getEquipeName(equipes, agent.equipeId)}</span>
                          </div>
                        </>
                      )}
                      {!agent.equipeId && (
                        <>
                          <span className="text-gray-300 hidden sm:inline">•</span>
                          <span className="text-xs text-gray-400 italic">Aucune équipe</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <button
                    onClick={() => onEditAgent(agent)}
                    className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-white hover:bg-gray-50 rounded-lg sm:rounded-xl transition-all border border-gray-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    title="Modifier"
                  >
                    <Edit2 size={16} className="sm:hidden" />
                    <Edit2 size={18} className="hidden sm:block" />
                    <span className="text-sm sm:hidden">Modifier</span>
                  </button>
                  <button
                    onClick={() => onDeleteAgent(agent.id)}
                    className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                    title="Supprimer"
                  >
                    <Trash2 size={16} className="sm:hidden" />
                    <Trash2 size={18} className="hidden sm:block" />
                    <span className="text-sm sm:hidden">Supprimer</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
