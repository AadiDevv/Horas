import { X, Clock } from 'lucide-react';
import { Timesheet } from '../services/timesheetService';
import { Absence } from '../services/absenceService';
import { formatDateLocal, formatDateTimeUTC, extractTimeLocal } from '@/app/utils/dateUtils';

interface Horaire {
  id: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

interface WeeklyTimelineProps {
  timesheets: Timesheet[];
  absences: Absence[];
  weekDays: Date[];
  onEditPair: (entry: Timesheet, exit?: Timesheet) => void;
  onDelete: (entry: Timesheet, exit?: Timesheet) => void;
  onCreate: (date: Date, hour: string) => void;
  onAbsenceClick?: (absence: Absence) => void;
  teamSchedule?: Horaire[];
}

export default function WeeklyTimeline({
  timesheets,
  absences,
  weekDays,
  onEditPair,
  onDelete,
  onCreate,
  onAbsenceClick,
  teamSchedule = []
}: WeeklyTimelineProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6h à 23h

  // Mapping des jours français vers les jours courts
  const jourMapping: Record<string, string> = {
    'Lundi': 'Mon',
    'Mardi': 'Tue',
    'Mercredi': 'Wed',
    'Jeudi': 'Thu',
    'Vendredi': 'Fri',
    'Samedi': 'Sat',
    'Dimanche': 'Sun'
  };

  // Créer un mapping des horaires par jour de la semaine
  const scheduleByDay: Record<string, Horaire | null> = {
    Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null
  };

  teamSchedule.forEach(horaire => {
    const dayKey = jourMapping[horaire.jour];
    if (dayKey) {
      scheduleByDay[dayKey] = horaire;
    }
  });

  // Fonction pour convertir une heure "HH:MM" en position pourcentage
  const timeToPosition = (time: string, minHour: number = 6, maxHour: number = 22): number => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const minMinutes = minHour * 60;
    const maxMinutes = maxHour * 60;
    return ((totalMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100;
  };

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

    // DEBUG: Logger les timesheets pour cette date
    if (dayTimesheets.length > 0) {
      console.log(`📅 Timesheets pour ${date}:`, sorted.map(ts => ({
        id: ts.id,
        timestamp: ts.timestamp,
        clockin: ts.clockin,
        hour: new Date(ts.timestamp).getHours()
      })));
    }

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
          // Entrée orpheline (en cours)
          console.log(`⚠️ Entrée orpheline détectée - ID ${ts.id} à ${ts.timestamp}`);
          pairs.push({ entry: ts });
          used.add(ts.id);
        }
      }
    }

    // Ajouter les sorties orphelines (sans entrée correspondante)
    for (const ts of sorted) {
      if (!used.has(ts.id) && ts.clockin === false) {
        console.log(`⚠️ Sortie orpheline détectée - ID ${ts.id} à ${ts.timestamp}`);
        pairs.push({ entry: ts });
        used.add(ts.id);
      }
    }

    console.log(`✅ Paires créées pour ${date}:`, pairs.length);
    return pairs;
  };

  // Récupérer les absences pour un jour donné
  const getAbsencesForDay = (dateStr: string): Absence[] => {
    return absences.filter(absence => {
      const startDate = absence.startDateTime.substring(0, 10);
      const endDate = absence.endDateTime.substring(0, 10);
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Convertir une heure ISO en position Y (en %)
  const getTimePosition = (isoTime: string): number => {
    const date = new Date(isoTime);
    const hour = date.getHours() + date.getMinutes() / 60;
    const minHour = 6;
    const maxHour = 23;
    const position = ((hour - minHour) / (maxHour - minHour)) * 100;

    // Clipper entre 0% et 97% pour garder visible même hors limites
    return Math.max(0, Math.min(97, position));
  };

  // Vérifier si un timestamp est hors limites (avant 6h ou après 23h)
  const isOutOfBounds = (isoTime: string): { isOut: boolean; position: 'before' | 'after' | null } => {
    const date = new Date(isoTime);
    const hour = date.getHours() + date.getMinutes() / 60;

    if (hour < 6) return { isOut: true, position: 'before' };
    if (hour > 23) return { isOut: true, position: 'after' };
    return { isOut: false, position: null };
  };

  // Convertir une position Y en heure
  const positionToHour = (position: number, dayDate: Date): string => {
    const minHour = 6;
    const maxHour = 24;
    const hour = minHour + (position / 100) * (maxHour - minHour);
    const hours = Math.floor(hour);
    const minutes = Math.floor((hour - hours) * 60);

    // Formater en ISO UTC sans conversion de timezone
    // L'heure cliquée reste l'heure stockée
    const dateStr = formatDateLocal(dayDate);
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return formatDateTimeUTC(dateStr, timeStr);
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

          // Récupérer l'horaire de l'équipe pour ce jour
          const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];
          const teamHoraire = scheduleByDay[dayOfWeek];

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

                {/* Horaire de l'équipe en arrière-plan */}
                {teamHoraire && (
                  <div
                    className="absolute left-0 right-0 rounded-lg border-2 z-5"
                    style={{
                      backgroundColor: 'rgba(51, 51, 51, 0.15)',
                      borderColor: 'rgba(51, 51, 51, 0.3)',
                      top: `${timeToPosition(teamHoraire.heureDebut)}%`,
                      height: `${timeToPosition(teamHoraire.heureFin) - timeToPosition(teamHoraire.heureDebut)}%`
                    }}
                  >
                    <div className="px-2 py-1 text-xs font-semibold flex flex-col items-center justify-center h-full text-gray-700">
                      <Clock size={14} className="mb-1" />
                      <div className="text-center leading-tight">
                        <div>{teamHoraire.heureDebut}</div>
                        <div className="opacity-75 text-[10px]">-</div>
                        <div>{teamHoraire.heureFin}</div>
                      </div>
                    </div>
                  </div>
                )}

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
                  const startPos = getTimePosition(pair.entry.timestamp);
                  // Extraire l'heure sans conversion timezone
                  const startTime = extractTimeLocal(pair.entry.timestamp);

                  // DEBUG: Logger la position pour les orphelins
                  if (!pair.exit) {
                    console.log(`🎯 Position orphelin ID ${pair.entry.id}: ${startPos}% à ${startTime}`);
                  }

                  if (pair.exit) {
                    // Paire complète : afficher un bloc
                    const endPos = getTimePosition(pair.exit.timestamp);
                    const height = endPos - startPos;
                    // Extraire l'heure sans conversion timezone
                    const endTime = extractTimeLocal(pair.exit.timestamp);
                    const entryOutOfBounds = isOutOfBounds(pair.entry.timestamp);
                    const exitOutOfBounds = isOutOfBounds(pair.exit.timestamp);
                    const hasOutOfBounds = entryOutOfBounds.isOut || exitOutOfBounds.isOut;

                    // Déterminer la couleur selon le statut
                    const isDelay = pair.entry.status === 'retard' || pair.entry.status === 'delay';
                    const bgColorClass = isDelay ? 'bg-orange-500' : 'bg-black';

                    return (
                      <div
                        key={pairIndex}
                        className={`absolute left-1 right-1 ${bgColorClass} text-white rounded-lg p-2 hover:shadow-lg transition-shadow group cursor-pointer ${hasOutOfBounds ? 'border-2 border-yellow-400' : ''}`}
                        style={{
                          top: `${startPos}%`,
                          height: `${height}%`,
                          minHeight: '48px',
                          zIndex: 20
                        }}
                        onClick={() => onEditPair(pair.entry, pair.exit)}
                        title={isDelay ? `🔶 RETARD ${hasOutOfBounds ? '- Bloc partiellement hors limites (6h-23h)' : ''}` : (hasOutOfBounds ? `⚠️ Bloc partiellement hors limites (6h-23h)` : undefined)}
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
                        <div className="text-xs font-semibold flex items-center gap-1">
                          {isDelay && <span title="Retard">🔶</span>}
                          {entryOutOfBounds.isOut && (
                            <span className="text-yellow-300" title="Début hors limites">⬆</span>
                          )}
                          {startTime}
                          {' → '}
                          {endTime}
                          {exitOutOfBounds.isOut && (
                            <span className="text-yellow-300" title="Fin hors limites">⬇</span>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    // Pointage individuel orphelin : afficher avec possibilité de supprimer
                    const isEntry = pair.entry.clockin;
                    const isDelay = pair.entry.status === 'retard' || pair.entry.status === 'delay';
                    const bgColor = isDelay ? 'bg-orange-500' : (isEntry ? 'bg-gray-400' : 'bg-gray-500');
                    const outOfBounds = isOutOfBounds(pair.entry.timestamp);

                    return (
                      <div
                        key={pairIndex}
                        className={`absolute left-1 right-1 ${bgColor} text-white rounded-lg px-2 py-1 group cursor-pointer hover:opacity-80 transition-opacity ${outOfBounds.isOut ? 'border-2 border-yellow-400' : ''}`}
                        style={{
                          top: `${startPos}%`,
                          height: '28px',
                          zIndex: 15
                        }}
                        onClick={() => onEditPair(pair.entry)}
                        title={`Pointage ${isEntry ? 'entrée' : 'sortie'} orphelin - Cliquer pour modifier${outOfBounds.isOut ? ` - HORS LIMITES (${outOfBounds.position === 'before' ? 'avant 6h' : 'après 23h'})` : ''}`}
                      >
                        {/* Bouton de suppression */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(pair.entry);
                          }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Supprimer le pointage"
                        >
                          <X size={10} />
                        </button>

                        {/* Contenu */}
                        <div className="text-xs italic flex items-center gap-1">
                          {outOfBounds.isOut && (
                            <span className="text-yellow-300 font-bold" title={outOfBounds.position === 'before' ? 'Avant 6h' : 'Après 23h'}>
                              {outOfBounds.position === 'before' ? '⬆' : '⬇'}
                            </span>
                          )}
                          {isEntry ? '→ ' : '← '}
                          {startTime}
                          {isEntry ? ' (entrée seule)' : ' (sortie seule)'}
                        </div>
                      </div>
                    );
                  }
                })}

                {/* Blocs d'absences */}
                {getAbsencesForDay(dateStr).map((absence, absenceIndex) => {
                  // Les absences bloquent uniquement les heures d'équipe si elles existent
                  if (!teamHoraire) return null; // Ne pas afficher si pas d'horaire d'équipe

                  const statusColors = {
                    'en_attente': 'bg-orange-400/90 border-orange-600',
                    'approuve': 'bg-red-400/90 border-red-600',
                    'refuse': 'bg-gray-400/90 border-gray-600',
                    'annule': 'bg-gray-300/90 border-gray-500'
                  };

                  const typeLabels: Record<string, string> = {
                    'conges_payes': 'Congés payés',
                    'conges_sans_solde': 'Congés sans solde',
                    'maladie': 'Maladie',
                    'formation': 'Formation',
                    'teletravail': 'Télétravail',
                    'autre': 'Autre'
                  };

                  const topPos = timeToPosition(teamHoraire.heureDebut);
                  const heightPos = timeToPosition(teamHoraire.heureFin) - topPos;

                  return (
                    <div
                      key={`absence-${absenceIndex}`}
                      className={`absolute left-1 right-1 text-white rounded-lg p-3 border-2 cursor-pointer hover:shadow-lg transition-shadow ${statusColors[absence.status]}`}
                      style={{
                        top: `${topPos}%`,
                        height: `${heightPos}%`,
                        zIndex: 30,
                        opacity: 0.9
                      }}
                      onClick={() => onAbsenceClick?.(absence)}
                      title={`Absence: ${typeLabels[absence.type]} - ${absence.status}`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-bold mb-1">
                          ABSENCE
                        </div>
                        <div className="text-xs font-semibold">
                          {typeLabels[absence.type]}
                        </div>
                        {absence.status === 'en_attente' && (
                          <div className="text-xs mt-1 font-medium">
                            En attente
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
