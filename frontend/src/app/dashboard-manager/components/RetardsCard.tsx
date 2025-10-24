import { Clock } from "lucide-react";

interface Retard {
  employeNom: string;
  minutes: number;
  heureArrivee: string;
}

interface RetardsCardProps {
  retards: Retard[];
  retardMoyen: number;
}

export default function RetardsCard({ retards, retardMoyen }: RetardsCardProps) {
  const getRetardColor = (minutes: number) => {
    // Nuances de gris/noir pour les différents niveaux
    if (minutes >= 30) return "#333333"; // Noir complet pour retard important
    if (minutes >= 15) return "#666666"; // Gris foncé
    return "#999999"; // Gris moyen
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(51, 51, 51, 0.1)' }}>
            <Clock size={24} style={{ color: '#333333' }} />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#333333' }}>Retards du Jour</h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" style={{ color: '#333333' }}>{retards.length}</span>
          <span className="text-sm text-gray-600">employé{retards.length > 1 ? 's' : ''} en retard</span>
        </div>
        {retards.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Retard moyen: <span className="font-semibold">{retardMoyen} min</span>
          </p>
        )}
      </div>

      {retards.length > 0 ? (
        <div className="space-y-2">
          {retards.slice(0, 3).map((retard, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: '#333333' }}>
                  {retard.employeNom.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span className="font-medium" style={{ color: '#333333' }}>{retard.employeNom}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: getRetardColor(retard.minutes) }}>
                  +{retard.minutes} min
                </span>
                <span className="text-xs text-gray-500">({retard.heureArrivee})</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(51, 51, 51, 0.1)' }}>
            <Clock size={28} style={{ color: '#333333' }} />
          </div>
          <p className="text-gray-600 font-medium">Aucun retard aujourd'hui</p>
          <p className="text-sm text-gray-500 mt-1">Excellente ponctualité !</p>
        </div>
      )}
    </div>
  );
}
