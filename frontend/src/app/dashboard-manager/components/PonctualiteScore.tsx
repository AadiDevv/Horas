import { Award, TrendingUp, TrendingDown } from "lucide-react";

interface EquipeScore {
  nom: string;
  score: number;
}

interface PonctualiteScoreProps {
  equipes: EquipeScore[];
  scoreGlobal: number;
  objectif: number;
}

export default function PonctualiteScore({ equipes, scoreGlobal, objectif }: PonctualiteScoreProps) {
  const getScoreColor = (score: number) => {

    if (score >= 90) return '#333333';
    if (score >= 75) return '#666666';
    return '#999999';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '✓';
    return '⚠';
  };

  const atteintObjectif = scoreGlobal >= objectif;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(51, 51, 51, 0.1)' }}>
            <Award size={24} style={{ color: '#333333' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#333333' }}>Score de Ponctualité</h3>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {equipes.map((equipe, idx) => {
          const color = getScoreColor(equipe.score);
          const icon = getScoreIcon(equipe.score);

          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: '#333333' }}>{equipe.nom}</span>
                  <span className="text-lg">{icon}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>
                  {equipe.score}%
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${equipe.score}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">Score Global</span>
          <div className="flex items-center gap-2">
            {atteintObjectif ? (
              <TrendingUp size={16} style={{ color: '#22c55e' }} />
            ) : (
              <TrendingDown size={16} style={{ color: '#ef4444' }} />
            )}
            <span className="text-2xl font-bold" style={{ color: atteintObjectif ? '#22c55e' : '#ef4444' }}>
              {scoreGlobal}%
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Objectif: {objectif}%</span>
          <span className="text-xs font-medium" style={{ color: atteintObjectif ? '#22c55e' : '#ef4444' }}>
            {atteintObjectif ? `+${scoreGlobal - objectif}% au-dessus` : `${objectif - scoreGlobal}% à rattraper`}
          </span>
        </div>
      </div>
    </div>
  );
}
