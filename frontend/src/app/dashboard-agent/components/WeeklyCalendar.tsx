import { Clock, User } from "lucide-react";
import { DayKey, TimeLog, Horaire } from "../types";
import { Absence } from "@/app/dashboard-manager/services/absenceService";

interface WeeklyCalendarProps {
  timeLogs: Record<DayKey, TimeLog[]>;
  isClockingIn: boolean;
  currentDayLogs: TimeLog;
  currentDayKey: DayKey;
  onRefresh: () => void;
  teamSchedule?: Horaire[];
  weekDays: Date[];
  absences?: Absence[];
}

const dayKeys: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayLabels: Record<DayKey, string> = {
  Mon: "Lun",
  Tue: "Mar",
  Wed: "Mer",
  Thu: "Jeu",
  Fri: "Ven",
  Sat: "Sam",
  Sun: "Dim",
};

const jourMapping: Record<string, DayKey> = {
  Lundi: "Mon",
  Mardi: "Tue",
  Mercredi: "Wed",
  Jeudi: "Thu",
  Vendredi: "Fri",
  Samedi: "Sat",
  Dimanche: "Sun",
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateBlockPosition(
  start: string,
  end: string,
  minTime: number,
  maxTime: number,
) {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  const totalRange = maxTime - minTime;

  const top = ((startMin - minTime) / totalRange) * 100;
  const height = ((endMin - startMin) / totalRange) * 100;

  return { top, height };
}

function DayTimeline({
  day,
  date,
  timeLogs,
  teamHoraire,
  isClockingIn,
  currentDayLogs,
  dayAbsences,
}: {
  day: DayKey;
  date: Date;
  timeLogs: TimeLog[];
  teamHoraire: Horaire | null;
  isClockingIn: boolean;
  currentDayLogs?: TimeLog;
  dayAbsences?: Absence[];
}) {
  let minTime = 6 * 60;
  let maxTime = 22 * 60;

  if (teamHoraire) {
    const scheduleStart = timeToMinutes(teamHoraire.heureDebut);
    const scheduleEnd = timeToMinutes(teamHoraire.heureFin);
    minTime = Math.min(minTime, scheduleStart - 60);
    maxTime = Math.max(maxTime, scheduleEnd + 60);
  }

  timeLogs.forEach((log) => {
    const logStart = timeToMinutes(log.start);
    minTime = Math.min(minTime, logStart - 30);
    if (log.end) {
      const logEnd = timeToMinutes(log.end);
      maxTime = Math.max(maxTime, logEnd + 30);
    }
  });

  minTime = Math.floor(minTime / 60) * 60;
  maxTime = Math.ceil(maxTime / 60) * 60;

  const hasContent = teamHoraire || timeLogs.length > 0 || isClockingIn;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.toDateString() === today.toDateString();

  return (
    <div className="flex flex-col">
      <div
        className={`font-semibold text-center mb-3 pb-2 border-b-2 rounded-t-lg ${
          isToday
            ? "bg-black text-white border-black"
            : "text-gray-700 border-gray-200"
        }`}
      >
        <div className="text-xs">{dayLabels[day]}</div>
        <div className="text-lg font-bold">{date.getDate()}</div>
      </div>

      <div className="flex-1 relative" style={{ minHeight: "300px" }}>
        {!hasContent ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-400 text-xs text-center">
              Jour de repos
            </span>
          </div>
        ) : (
          <div className="relative h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="absolute inset-0">
              {Array.from({
                length: Math.ceil((maxTime - minTime) / 60) + 1,
              }).map((_, i) => {
                const hour = Math.floor(minTime / 60) + i;
                const position = (i / ((maxTime - minTime) / 60)) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${position}%` }}
                  >
                    <span className="absolute -left-12 -top-2 text-xs text-gray-400 font-medium">
                      {hour.toString().padStart(2, "0")}:00
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-0">
              {teamHoraire && (
                <div
                  className="absolute left-0 right-0 rounded-lg border-2"
                  style={{
                    backgroundColor: "rgba(51, 51, 51, 0.3)",
                    borderColor: "#333333",
                    top: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).top}%`,
                    height: `${calculateBlockPosition(teamHoraire.heureDebut, teamHoraire.heureFin, minTime, maxTime).height}%`,
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

              {timeLogs.map((log, idx) => {
                if (!log.end) {
                  return null;
                }
                const position = calculateBlockPosition(
                  log.start,
                  log.end,
                  minTime,
                  maxTime,
                );

                const startMin = timeToMinutes(log.start);
                const endMin = timeToMinutes(log.end);
                const durationMinutes = endMin - startMin;
                const isShortBlock = durationMinutes < 15;

                const isDelay = log.status === 'retard';
                const bgColorClass = isDelay ? "bg-orange-500" : "bg-black";

                return (
                  <div
                    key={idx}
                    className={`absolute left-3 right-1 ${bgColorClass} text-white rounded-lg p-2 hover:shadow-lg transition-shadow group cursor-pointer z-10`}
                    style={{
                      top: `${position.top}%`,
                      height: `${position.height}%`,
                      minHeight: isShortBlock ? "24px" : "36px",
                    }}
                    title={isDelay ? "🔶 RETARD" : undefined}
                  >
                    <div className="text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 justify-center flex-wrap h-full">
                      {isDelay && <span className="flex-shrink-0" title="Retard">🔶</span>}
                      <span className="flex-shrink-0">{log.start}</span>
                      <span className="flex-shrink-0"> → </span>
                      <span className="flex-shrink-0">{log.end}</span>
                    </div>
                  </div>
                );
              })}

              {isClockingIn &&
                currentDayLogs &&
                (() => {
                  const now = new Date();
                  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
                  const position = calculateBlockPosition(
                    currentDayLogs.start,
                    currentTime,
                    minTime,
                    maxTime,
                  );

                  const startMin = timeToMinutes(currentDayLogs.start);
                  const currentMin = timeToMinutes(currentTime);
                  const currentDuration = currentMin - startMin;
                  const isShortBlock = currentDuration < 15;

                  return (
                    <div
                      className="absolute left-3 right-1 bg-black text-white shadow-xl rounded-lg z-20 transition-all duration-1000"
                      style={{
                        top: `${position.top}%`,
                        height: `${Math.max(position.height, 5)}%`,
                        minHeight: isShortBlock ? "24px" : "36px",
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                        backgroundSize: "20px 20px",
                        animation: "shimmer 2s linear infinite",
                      }}
                    >
                      {isShortBlock ? (
                        <div className="px-2 py-0.5 text-[10px] font-semibold flex items-center justify-center h-full whitespace-nowrap overflow-hidden">
                          <User size={12} className="mr-1 animate-pulse" />
                          {currentDayLogs.start} → En cours...
                        </div>
                      ) : (
                        <div className="px-2 py-1 text-xs font-bold flex flex-col items-center justify-center h-full">
                          <User size={14} className="mb-1 animate-pulse" />
                          <div className="text-center leading-tight">
                            <div>{currentDayLogs.start}</div>
                            <div className="opacity-75 text-[10px] my-1">↓</div>
                            <div className="text-[10px] animate-pulse">
                              En cours
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {dayAbsences &&
                dayAbsences.map((absence, idx) => {
                  if (!teamHoraire) return null;

                  const position = calculateBlockPosition(
                    teamHoraire.heureDebut,
                    teamHoraire.heureFin,
                    minTime,
                    maxTime,
                  );

                  const statusColors = {
                    en_attente: "bg-orange-400/90 border-orange-600",
                    approuve: "bg-red-400/90 border-red-600",
                    refuse: "bg-gray-400/90 border-gray-600",
                    annule: "bg-gray-300/90 border-gray-500",
                  };

                  return (
                    <div
                      key={`absence-${idx}`}
                      className={`absolute left-0 right-0 rounded-lg border-2 ${statusColors[absence.status]} z-30`}
                      style={{
                        top: `${position.top}%`,
                        height: `${position.height}%`,
                        opacity: 0.9,
                      }}
                    >
                      <div className="px-2 py-2 text-xs font-bold text-white flex flex-col items-center justify-center h-full">
                        <div className="text-center">ABSENCE</div>
                        {absence.status === "en_attente" && (
                          <div className="text-[10px] mt-1">En attente</div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
  teamSchedule = [],
  weekDays,
  absences = [],
}: WeeklyCalendarProps) {
  const scheduleByDay: Record<DayKey, Horaire | null> = {
    Mon: null,
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
    Sun: null,
  };

  teamSchedule.forEach((horaire) => {
    const dayKey = jourMapping[horaire.jour];
    if (dayKey) {
      scheduleByDay[dayKey] = horaire;
    }
  });

  const absencesByDay: Record<DayKey, Absence[]> = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };

  absences.forEach((absence) => {
    const startDate = new Date(absence.startDateTime);
    const endDate = new Date(absence.endDateTime);

    weekDays.forEach((day, index) => {
      const dayKey = dayKeys[index];
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (dayDate >= start && dayDate <= end && absence.status !== "refuse") {
        absencesByDay[dayKey].push(absence);
      }
    });
  });

  return (
    <div className="bg-gray-50 rounded-3xl p-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex items-center justify-center border-2"
              style={{
                backgroundColor: "#333333",
                opacity: 0.3,
                borderColor: "rgba(51, 51, 51, 0.4)",
              }}
            >
              <Clock size={10} className="text-gray-800" />
            </div>
            <span className="text-gray-600">Horaire équipe (fond)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex items-center justify-center bg-black"
            >
              <User size={10} className="text-white" />
            </div>
            <span className="text-gray-600">Vos pointages (superposés)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded flex items-center justify-center bg-orange-500"
            >
              <span className="text-[8px]">🔶</span>
            </div>
            <span className="text-gray-600">Retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded bg-black relative overflow-hidden"
            >
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
                  backgroundSize: "8px 8px",
                }}
              ></div>
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
            currentDayLogs={
              isClockingIn && currentDayKey === day ? currentDayLogs : undefined
            }
            dayAbsences={absencesByDay[day]}
          />
        ))}
      </div>
    </div>
  );
}
