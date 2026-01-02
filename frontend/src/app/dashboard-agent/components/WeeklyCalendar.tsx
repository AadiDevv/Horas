import { Clock, User } from 'lucide-react';
import { DayKey, TimeLog, Horaire } from '../types';

interface WeeklyCalendarProps {
  timeLogs: Record<DayKey, TimeLog[]>;
  isClockingIn: boolean;
  currentDayLogs: TimeLog;
  currentDayKey: DayKey;
  onRefresh: () => void;
  teamSchedule?: Horaire[];
  weekDays: Date[];
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
  date,
  timeLogs,
  teamHoraire,
  isClockingIn,
  currentDayLogs
}: {
  day: DayKey;
  date: Date;
  timeLogs: TimeLog[];
  teamHoraire: Horaire | null;
  isClockingIn: boolean;
  currentDayLogs?: TimeLog;
}) {
  // console.log(`📅 DayTimeline ${day}:`, { timeLogs, teamHoraire, isClockingIn, currentDayLogs });

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

  // Vérifier si c'est aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();

  return (
    <div className="flex flex-col">
      <div className={`font-semibold text-center mb-3 pb-2 border-b-2 rounded-t-lg ${
        isToday ? 'bg-black text-white border-black' : 'text-gray-700 border-gray-200'
      }`}>
        <div className="text-xs">
          {dayLabels[day]}
        </div>
        <div className="text-lg font-bold">
          {date.getDate()}
        </div>
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

            {/* Container pour les blocs superposés (style Google Calendar) */}
            <div className="absolute inset-0">
              {/* Horaire de l'équipe en arrière-plan (pleine largeur) */}
              {teamHoraire && (
                <div
                  className="absolute left-0 right-0 rounded-lg border-2"
                  style={{
                    backgroundColor: 'rgba(51, 51, 51, 0.3)',
                    borderColor: '#333333',
                    top: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).top}%`,
                    height: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).height}%`
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

              {/* Pointages réels superposés (petit espace à gauche pour apercevoir le fond) */}
              {timeLogs.map((log, idx) => {
                if (!log.end) {
                  // console.log(`⚠️ ${day} - Log ${idx} ignoré (pas de end):`, log);
                  return null;
                }
                const position = calculateBlockPosition(log.start, log.end, minTime, maxTime);

                // Calculer la durée en minutes
                const startMin = timeToMinutes(log.start);
                const endMin = timeToMinutes(log.end);
                const durationMinutes = endMin - startMin;
                const isShortBlock = durationMinutes < 15;

                // console.log(`🎨 ${day} - Bloc ${idx}:`, { log, position, durationMinutes, isShortBlock, minTime, maxTime });

                return (
                  <div
                    key={idx}
                    className="absolute text-white shadow-lg rounded-lg z-10 border-2 transition-all duration-200 hover:z-50 hover:shadow-2xl group cursor-pointer"
                    style={{
                      backgroundColor: '#333333',
                      borderColor: '#1a1a1a',
                      left: '12px',
                      right: '4px',
                      top: `${position.top}%`,
                      height: `${position.height}%`,
                      minHeight: isShortBlock ? '24px' : '40px'
                    }}
                  >
                    {isShortBlock ? (
                      // Affichage compact pour blocs < 15 min
                      <div className="px-2 py-0.5 text-[10px] font-semibold flex items-center justify-center h-full whitespace-nowrap overflow-hidden group-hover:scale-110 transition-transform">
                        {log.start} → {log.end}
                      </div>
                    ) : (
                      // Affichage normal pour blocs >= 15 min
                      <div className="px-2 py-1 text-xs font-bold flex flex-col items-center justify-center h-full">
                        <User size={14} className="mb-1" />
                        <div className="text-center leading-tight">
                          <div>{log.start}</div>
                          <div className="opacity-75 text-[10px]">-</div>
                          <div>{log.end}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pointage en cours avec croissance dynamique et effet skeleton */}
              {isClockingIn && currentDayLogs && (() => {
                const now = new Date();
                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                const position = calculateBlockPosition(currentDayLogs.start, currentTime, minTime, maxTime);

                // Calculer la durée actuelle en minutes
                const startMin = timeToMinutes(currentDayLogs.start);
                const currentMin = timeToMinutes(currentTime);
                const currentDuration = currentMin - startMin;
                const isShortBlock = currentDuration < 15;

                return (
                  <div
                    className="absolute text-white shadow-xl rounded-lg z-20 border-2 transition-all duration-1000"
                    style={{
                      backgroundColor: '#333333',
                      borderColor: '#1a1a1a',
                      left: '12px',
                      right: '4px',
                      top: `${position.top}%`,
                      height: `${Math.max(position.height, 5)}%`,
                      minHeight: isShortBlock ? '24px' : '40px',
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                      backgroundSize: '20px 20px',
                      animation: 'shimmer 2s linear infinite'
                    }}
                  >
                    {isShortBlock ? (
                      // Affichage compact sur une ligne pour bloc court
                      <div className="px-2 py-0.5 text-[10px] font-semibold flex items-center justify-center h-full whitespace-nowrap overflow-hidden">
                        <User size={12} className="mr-1 animate-pulse" />
                        {currentDayLogs.start} → En cours...
                      </div>
                    ) : (
                      // Affichage normal pour bloc plus long
                      <div className="px-2 py-1 text-xs font-bold flex flex-col items-center justify-center h-full">
                        <User size={14} className="mb-1 animate-pulse" />
                        <div className="text-center leading-tight">
                          <div>{currentDayLogs.start}</div>
                          <div className="opacity-75 text-[10px] my-1">↓</div>
                          <div className="text-[10px] animate-pulse">En cours</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRefresh,
  teamSchedule = [],
  weekDays
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
      <div className="mb-6">
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center border-2" style={{ backgroundColor: '#333333', opacity: 0.3, borderColor: 'rgba(51, 51, 51, 0.4)' }}>
              <Clock size={10} className="text-gray-800" />
            </div>
            <span className="text-gray-600">Horaire équipe (fond)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex items-center justify-center border-2" style={{ backgroundColor: '#333333', borderColor: '#1a1a1a' }}>
              <User size={10} className="text-white" />
            </div>
            <span className="text-gray-600">Vos pointages (superposés)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 relative overflow-hidden" style={{ backgroundColor: '#333333', borderColor: '#1a1a1a' }}>
              <div className="absolute inset-0 animate-pulse" style={{
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                backgroundSize: '8px 8px'
              }}></div>
            </div>
            <span className="text-gray-600">En cours</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4 pl-12">
        {dayKeys.map((day, index) => (
          <DayTimeline
            key={day}
            day={day}
            date={weekDays[index] || new Date()}
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
