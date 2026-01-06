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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold">Gestion des Agents</h2>
        <button
          onClick={onAddAgent}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all"
        >
          <UserPlus size={20} />
          Ajouter un agent
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Aucun agent pour le moment</p>
              <button
                onClick={onAddAgent}
                className="mt-4 text-black hover:underline font-medium"
              >
                Créer votre premier agent
              </button>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {agent.prenom.charAt(0)}{agent.nom.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {agent.prenom} {agent.nom}
                    </p>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-gray-500 capitalize">{agent.role}</p>
                      {agent.equipeId && (
                        <>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                            <Users size={12} />
                            <span>{getEquipeName(equipes, agent.equipeId)}</span>
                          </div>
                        </>
                      )}
                      {!agent.equipeId && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400 italic">Aucune équipe</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditAgent(agent)}
                    className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all border border-gray-200"
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteAgent(agent.id)}
                    className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
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
