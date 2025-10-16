import { Clock, User } from 'lucide-react';
import { DayKey, TimeLog, Horaire } from '../types';

interface WeeklyCalendarProps {
  timeLogs: Record<DayKey, TimeLog[]>;
  isClockingIn: boolean;
  currentDayLogs: TimeLog;
  currentDayKey: DayKey;
  onRefresh: () => void;
  teamSchedule?: Horaire[];
}

const dayKeys: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayLabels: Record<DayKey, string> = {
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mer',
  Thu: 'Jeu',
  Fri: 'Ven',
  Sat: 'Sam',
  Sun: 'Dim'
};

const jourMapping: Record<string, DayKey> = {
  'Lundi': 'Mon',
  'Mardi': 'Tue',
  'Mercredi': 'Wed',
  'Jeudi': 'Thu',
  'Vendredi': 'Fri',
  'Samedi': 'Sat',
  'Dimanche': 'Sun'
};

// Convertir une heure (HH:MM) en minutes depuis minuit
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Calculer la position et la hauteur d'un bloc dans la timeline
function calculateBlockPosition(start: string, end: string, minTime: number, maxTime: number) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const totalRange = maxTime - minTime;

  const top = ((startMin - minTime) / totalRange) * 100;
  const height = ((endMin - startMin) / totalRange) * 100;

  return { top, height };
}

// Composant Timeline pour un jour
function DayTimeline({
  day,
  timeLogs,
  teamHoraire,
  isClockingIn,
  currentDayLogs
}: {
  day: DayKey;
  timeLogs: TimeLog[];
  teamHoraire: Horaire | null;
  isClockingIn: boolean;
  currentDayLogs?: TimeLog;
}) {
  // Déterminer la plage horaire à afficher
  let minTime = 6 * 60; // 6:00
  let maxTime = 22 * 60; // 22:00

  if (teamHoraire) {
    const scheduleStart = timeToMinutes(teamHoraire.heureDebut);
    const scheduleEnd = timeToMinutes(teamHoraire.heureFin);
    minTime = Math.min(minTime, scheduleStart - 60);
    maxTime = Math.max(maxTime, scheduleEnd + 60);
  }

  timeLogs.forEach(log => {
    const logStart = timeToMinutes(log.start);
    minTime = Math.min(minTime, logStart - 30);
    if (log.end) {
      const logEnd = timeToMinutes(log.end);
      maxTime = Math.max(maxTime, logEnd + 30);
    }
  });

  // Arrondir à l'heure
  minTime = Math.floor(minTime / 60) * 60;
  maxTime = Math.ceil(maxTime / 60) * 60;

  const hasContent = teamHoraire || timeLogs.length > 0 || isClockingIn;

  return (
    <div className="flex flex-col">
      <div className="font-semibold text-gray-700 text-center mb-3 pb-2 border-b-2 border-gray-200">
        {dayLabels[day]}
      </div>

      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        {!hasContent ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-xs text-center">Aucune heure</span>
          </div>
        ) : (
          <div className="relative h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Grille horaire en arrière-plan */}
            <div className="absolute inset-0">
              {Array.from({ length: Math.ceil((maxTime - minTime) / 60) + 1 }).map((_, i) => {
                const hour = Math.floor(minTime / 60) + i;
                const position = (i / ((maxTime - minTime) / 60)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${position}%` }}
                  >
                    <span className="absolute -left-12 -top-2 text-xs text-gray-400 font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Container pour les blocs côte à côte */}
            <div className="absolute inset-0 flex">
              {/* Colonne gauche: Horaire de l'équipe */}
              <div className="relative flex-1">
                {teamHoraire && (
                  <div
                    className="absolute left-0 right-1 bg-blue-400 text-white shadow-sm rounded-r-lg"
                    style={{
                      top: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).top}%`,
                      height: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).height}%`
                    }}
                  >
                    <div className="px-1.5 py-1 text-xs font-semibold flex flex-col items-center justify-center h-full">
                      <Clock size={14} className="mb-1" />
                      <div className="text-center leading-tight">
                        <div>{teamHoraire.heureDebut}</div>
                        <div className="opacity-75 text-[10px]">-</div>
                        <div>{teamHoraire.heureFin}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite: Pointages réels */}
              <div className="relative flex-1">
                {timeLogs.map((log, idx) => {
                  if (!log.end) return null;
                  const position = calculateBlockPosition(log.start, log.end, minTime, maxTime);

                  return (
                    <div
                      key={idx}
                      className="absolute left-1 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md rounded-l-lg"
                      style={{
                        top: `${position.top}%`,
                        height: `${position.height}%`
                      }}
                    >
                      <div className="px-1.5 py-1 text-xs font-bold flex flex-col items-center justify-center h-full">
                        <User size={14} className="mb-1" />
                        <div className="text-center leading-tight">
                          <div>{log.start}</div>
                          <div className="opacity-75 text-[10px]">-</div>
                          <div>{log.end}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pointage en cours */}
                {isClockingIn && currentDayLogs && (
                  <div
                    className="absolute left-1 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-l-lg animate-pulse"
                    style={{
                      top: `${calculateBlockPosition(currentDayLogs.start, '23:59', minTime, maxTime).top}%`,
                      height: `${calculateBlockPosition(currentDayLogs.start, '23:59', minTime, maxTime).height}%`
                    }}
                  >
                    <div className="px-1.5 py-1 text-xs font-bold flex flex-col items-center justify-center h-full">
                      <User size={14} className="mb-1" />
                      <div className="text-center leading-tight">
                        <div>{currentDayLogs.start}</div>
                        <div className="opacity-75 text-[10px] my-1">↓</div>
                        <div className="text-[10px]">En cours</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WeeklyCalendar({
  timeLogs,
  isClockingIn,
  currentDayLogs,
  currentDayKey,
  onRefresh,
  teamSchedule = []
}: WeeklyCalendarProps) {
  const scheduleByDay: Record<DayKey, Horaire | null> = {
    Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null
  };

  teamSchedule.forEach(horaire => {
    const dayKey = jourMapping[horaire.jour];
    if (dayKey) {
      scheduleByDay[dayKey] = horaire;
    }
  });

  return (
    <div className="bg-gray-50 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Planning Hebdomadaire</h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded flex items-center justify-center">
                <Clock size={10} className="text-white" />
              </div>
              <span className="text-gray-600">Horaire équipe (gauche)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                <User size={10} className="text-white" />
              </div>
              <span className="text-gray-600">Vos pointages (droite)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded animate-pulse"></div>
              <span className="text-gray-600">En cours</span>
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-white hover:bg-gray-100 rounded-xl font-medium text-sm border border-gray-200 transition"
        >
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4 pl-12">
        {dayKeys.map(day => (
          <DayTimeline
            key={day}
            day={day}
            timeLogs={timeLogs[day]}
            teamHoraire={scheduleByDay[day]}
            isClockingIn={isClockingIn && currentDayKey === day}
            currentDayLogs={isClockingIn && currentDayKey === day ? currentDayLogs : undefined}
          />
        ))}
      </div>
    </div>
  );
}
