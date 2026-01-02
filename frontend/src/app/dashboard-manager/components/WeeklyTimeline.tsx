import { X } from 'lucide-react';
import { Timesheet } from '../services/timesheetService';
import { formatDateLocal } from '@/app/utils/dateUtils';

interface WeeklyTimelineProps {
  timesheets: Timesheet[];
  weekDays: Date[];
  onEditPair: (entry: Timesheet, exit?: Timesheet) => void;
  onDelete: (entry: Timesheet, exit?: Timesheet) => void;
  onCreate: (date: Date, hour: string) => void;
}

export default function WeeklyTimeline({
  timesheets,
  weekDays,
  onEditPair,
  onDelete,
  onCreate
}: WeeklyTimelineProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6h à 22h

  // Grouper les timesheets par date (extraite du timestamp)
  const timesheetsByDate = timesheets.reduce((acc, ts) => {
    const date = ts.timestamp.substring(0, 10); // "YYYY-MM-DD"
    if (!acc[date]) acc[date] = [];
    acc[date].push(ts);
    return acc;
  }, {} as Record<string, Timesheet[]>);

  // Créer des paires entrée/sortie ET pointages individuels
  const getTimesheetPairs = (date: string): Array<{ entry: Timesheet; exit?: Timesheet }> => {
    const dayTimesheets = timesheetsByDate[date] || [];
    const sorted = [...dayTimesheets].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const pairs: Array<{ entry: Timesheet; exit?: Timesheet }> = [];
    const used = new Set<number>();

    // Trouver les paires
    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i].id)) continue;

      const ts = sorted[i];
      if (ts.clockin === true) {
        // Chercher une sortie correspondante
        const nextExit = sorted.slice(i + 1).find(t => t.clockin === false && !used.has(t.id));
        if (nextExit) {
          pairs.push({ entry: ts, exit: nextExit });
          used.add(ts.id);
          used.add(nextExit.id);
        } else {
          pairs.push({ entry: ts });
          used.add(ts.id);
        }
      }
    }

    // Ajouter les sorties orphelines (sans entrée correspondante)
    for (const ts of sorted) {
      if (!used.has(ts.id) && ts.clockin === false) {
        pairs.push({ entry: ts });
        used.add(ts.id);
      }
    }

    return pairs;
  };

  // Convertir une heure ISO en position Y (en %)
  const getTimePosition = (isoTime: string): number => {
    const date = new Date(isoTime);
    const hour = date.getHours() + date.getMinutes() / 60;
    const minHour = 6;
    const maxHour = 22;
    return ((hour - minHour) / (maxHour - minHour)) * 100;
  };

  // Convertir une position Y en heure
  const positionToHour = (position: number, dayDate: Date): string => {
    const minHour = 6;
    const maxHour = 22;
    const hour = minHour + (position / 100) * (maxHour - minHour);
    const hours = Math.floor(hour);
    const minutes = Math.floor((hour - hours) * 60);

    const date = new Date(dayDate);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  return (
    <div className="relative">
      {/* Grille horaire */}
      <div className="grid grid-cols-8 gap-2">
        {/* Colonne des heures */}
        <div className="col-span-1">
          <div className="h-12"></div> {/* Espace pour les jours */}
          {hours.map(hour => (
            <div key={hour} className="h-16 flex items-center justify-end pr-2 text-sm text-gray-500">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {weekDays.map((day, dayIndex) => {
          const dateStr = formatDateLocal(day);
          const pairs = getTimesheetPairs(dateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isToday = dateStr === formatDateLocal(today);

          return (
            <div key={dayIndex} className="col-span-1 relative">
              {/* En-tête jour */}
              <div className={`h-12 flex flex-col items-center justify-center rounded-t-lg ${
                isToday ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-xs font-medium">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">
                  {day.getDate()}
                </div>
              </div>

              {/* Zone horaire */}
              <div className="relative h-[1088px] bg-gray-50 border border-gray-200 rounded-b-lg overflow-hidden">
                {/* Lignes horaires */}
                {hours.map((hour, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="absolute left-0 right-0 h-16 border-b border-gray-200 z-0"
                    style={{ top: `${hourIndex * 64}px` }}
                  />
                ))}

                {/* Zone cliquable pour créer un bloc de 1h - DOIT ÊTRE AVANT les blocs */}
                <div
                  className="absolute inset-0 hover:bg-blue-50/50 transition-colors cursor-pointer z-10"
                  onClick={async (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const position = (y / rect.height) * 100;
                    const startHour = positionToHour(position, day);

                    await onCreate(day, startHour);
                  }}
                  title="Cliquer pour créer un bloc de 1h"
                />

                {/* Blocs de pointages */}
                {pairs.map((pair, pairIndex) => {
                  const startDate = new Date(pair.entry.timestamp);
                  const startPos = getTimePosition(pair.entry.timestamp);

                  if (pair.exit) {
                    // Paire complète : afficher un bloc
                    const endDate = new Date(pair.exit.timestamp);
                    const endPos = getTimePosition(pair.exit.timestamp);
                    const height = endPos - startPos;

                    return (
                      <div
                        key={pairIndex}
                        className="absolute left-1 right-1 bg-black text-white rounded-lg p-2 hover:shadow-lg transition-shadow group cursor-pointer"
                        style={{
                          top: `${startPos}%`,
                          height: `${height}%`,
                          minHeight: '48px',
                          zIndex: 20
                        }}
                        onClick={() => onEditPair(pair.entry, pair.exit)}
                      >
                        {/* Bouton de suppression */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(pair.entry, pair.exit);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Supprimer le bloc"
                        >
                          <X size={14} />
                        </button>

                        {/* Contenu */}
                        <div className="text-xs font-semibold">
                          {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' → '}
                          {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  } else {
                    // Pointage individuel orphelin : afficher en lecture seule (info)
                    const isEntry = pair.entry.clockin;
                    const bgColor = isEntry ? 'bg-gray-400' : 'bg-gray-500';

                    return (
                      <div
                        key={pairIndex}
                        className={`absolute left-1 right-1 ${bgColor} text-white rounded-lg px-2 py-1 opacity-60`}
                        style={{
                          top: `${startPos}%`,
                          height: '28px',
                          zIndex: 15
                        }}
                        title={`Pointage ${isEntry ? 'entrée' : 'sortie'} orphelin - lecture seule`}
                      >
                        {/* Contenu */}
                        <div className="text-xs italic">
                          {isEntry ? '→ ' : '← '}
                          {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {isEntry ? ' (entrée seule)' : ' (sortie seule)'}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
