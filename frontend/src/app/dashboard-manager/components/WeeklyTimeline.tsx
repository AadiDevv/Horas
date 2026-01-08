import { X, Clock } from "lucide-react";
import { Timesheet } from "../services/timesheetService";
import { Absence } from "../services/absenceService";
import {
  formatDateLocal,
  formatDateTimeUTC,
  extractTimeLocal,
} from "@/app/utils/dateUtils";
import { Horaire } from "@/app/dashboard-agent/types";
import {
  getTimesheetBlockStyle,
  getOrphanBlockStyle,
  getAbsenceHybridStyle,
  getAbsenceTypeLabel,
  TIMELINE_UI_STYLES,
  type TimesheetStatus,
  type AbsenceStatus,
  type AbsenceType,
} from '../config/timelineStylesConfig';

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
  teamSchedule = [],
}: WeeklyTimelineProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  const jourMapping: Record<string, string> = {
    Lundi: "Mon",
    Mardi: "Tue",
    Mercredi: "Wed",
    Jeudi: "Thu",
    Vendredi: "Fri",
    Samedi: "Sat",
    Dimanche: "Sun",
  };

  const scheduleByDay: Record<string, Horaire | null> = {
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

  const timeToPosition = (
    time: string,
    minHour: number = 6,
    maxHour: number = 22,
  ): number => {
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const minMinutes = minHour * 60;
    const maxMinutes = maxHour * 60;
    return ((totalMinutes - minMinutes) / (maxMinutes - minMinutes)) * 100;
  };

  const timesheetsByDate = timesheets.reduce(
    (acc, ts) => {
      const date = ts.timestamp.substring(0, 10);
      if (!acc[date]) acc[date] = [];
      acc[date].push(ts);
      return acc;
    },
    {} as Record<string, Timesheet[]>,
  );

  const getTimesheetPairs = (
    date: string,
  ): Array<{ entry: Timesheet; exit?: Timesheet }> => {
    const dayTimesheets = timesheetsByDate[date] || [];
    const sorted = [...dayTimesheets].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    const pairs: Array<{ entry: Timesheet; exit?: Timesheet }> = [];
    const used = new Set<number>();

    if (dayTimesheets.length > 0) {
      console.log(
        `📅 Timesheets pour ${date}:`,
        sorted.map((ts) => ({
          id: ts.id,
          timestamp: ts.timestamp,
          clockin: ts.clockin,
          hour: new Date(ts.timestamp).getHours(),
        })),
      );
    }

    for (let i = 0; i < sorted.length; i++) {
      if (used.has(sorted[i].id)) continue;

      const ts = sorted[i];
      if (ts.clockin === true) {
        const nextExit = sorted
          .slice(i + 1)
          .find((t) => t.clockin === false && !used.has(t.id));
        if (nextExit) {
          pairs.push({ entry: ts, exit: nextExit });
          used.add(ts.id);
          used.add(nextExit.id);
        } else {
          console.log(
            `⚠️ Entrée orpheline détectée - ID ${ts.id} à ${ts.timestamp}`,
          );
          pairs.push({ entry: ts });
          used.add(ts.id);
        }
      }
    }

    for (const ts of sorted) {
      if (!used.has(ts.id) && ts.clockin === false) {
        console.log(
          `⚠️ Sortie orpheline détectée - ID ${ts.id} à ${ts.timestamp}`,
        );
        pairs.push({ entry: ts });
        used.add(ts.id);
      }
    }

    console.log(`✅ Paires créées pour ${date}:`, pairs.length);
    return pairs;
  };

  const getAbsencesForDay = (dateStr: string): Absence[] => {
    return absences.filter((absence) => {
      const startDate = absence.startDateTime.substring(0, 10);
      const endDate = absence.endDateTime.substring(0, 10);
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const getTimePosition = (isoTime: string): number => {
    const date = new Date(isoTime);
    const hour = date.getHours() + date.getMinutes() / 60;
    const minHour = 6;
    const maxHour = 23;
    const position = ((hour - minHour) / (maxHour - minHour)) * 100;

    return Math.max(0, Math.min(97, position));
  };

  const isOutOfBounds = (
    isoTime: string,
  ): { isOut: boolean; position: "before" | "after" | null } => {
    const date = new Date(isoTime);
    const hour = date.getHours() + date.getMinutes() / 60;

    if (hour < 6) return { isOut: true, position: "before" };
    if (hour > 23) return { isOut: true, position: "after" };
    return { isOut: false, position: null };
  };

  const positionToHour = (position: number, dayDate: Date): string => {
    const minHour = 6;
    const maxHour = 24;
    const hour = minHour + (position / 100) * (maxHour - minHour);
    const hours = Math.floor(hour);
    const minutes = Math.floor((hour - hours) * 60);

    const dateStr = formatDateLocal(dayDate);
    const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    return formatDateTimeUTC(dateStr, timeStr);
  };

  return (
    <div className="relative overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="grid grid-cols-8 gap-1 sm:gap-2 min-w-[600px] sm:min-w-0">
        <div className="col-span-1">
          <div className="h-10 sm:h-12"></div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-12 sm:h-16 flex items-center justify-end pr-1 sm:pr-2 text-xs sm:text-sm text-gray-500"
            >
              {hour.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {weekDays.map((day, dayIndex) => {
          const dateStr = formatDateLocal(day);
          const pairs = getTimesheetPairs(dateStr);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isToday = dateStr === formatDateLocal(today);

          const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            day.getDay()
          ];
          const teamHoraire = scheduleByDay[dayOfWeek];

          return (
            <div key={dayIndex} className="col-span-1 relative">
              <div
                className={`h-10 sm:h-12 flex flex-col items-center justify-center rounded-t-lg ${
                  isToday ? TIMELINE_UI_STYLES.dayHeader.today : TIMELINE_UI_STYLES.dayHeader.other
                }`}
              >
                <div className="text-[10px] sm:text-xs font-medium">
                  {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                </div>
                <div className="text-base sm:text-lg font-bold">{day.getDate()}</div>
              </div>

              <div className={`relative h-[816px] sm:h-[1088px] ${TIMELINE_UI_STYLES.grid.background} border ${TIMELINE_UI_STYLES.grid.border} rounded-b-lg overflow-hidden`}>
                {hours.map((hour, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`absolute left-0 right-0 h-12 sm:h-16 border-b ${TIMELINE_UI_STYLES.grid.border} z-0`}
                    style={{ top: `${hourIndex * 48}px`, height: '48px' }}
                    data-sm-top={`${hourIndex * 64}px`}
                  />
                ))}

                {teamHoraire && (
                  <div
                    className="absolute left-0 right-0 rounded-lg z-5"
                    style={{
                      backgroundColor: TIMELINE_UI_STYLES.teamSchedule.bgColor,
                      top: `${timeToPosition(teamHoraire.heureDebut)}%`,
                      height: `${timeToPosition(teamHoraire.heureFin) - timeToPosition(teamHoraire.heureDebut)}%`,
                    }}
                  >
                    <div className={`px-1 sm:px-2 py-1 text-[10px] sm:text-xs font-semibold flex flex-col items-center justify-center h-full ${TIMELINE_UI_STYLES.teamSchedule.textColor}`}>
                      <Clock size={12} className="mb-1 sm:hidden" />
                      <Clock size={14} className="mb-1 hidden sm:block" />
                      <div className="text-center leading-tight">
                        <div>{teamHoraire.heureDebut}</div>
                        <div className="opacity-75 text-[8px] sm:text-[10px]">-</div>
                        <div>{teamHoraire.heureFin}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`absolute inset-0 ${TIMELINE_UI_STYLES.creationOverlay} transition-colors cursor-pointer z-10`}
                  onClick={async (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const position = (y / rect.height) * 100;
                    const startHour = positionToHour(position, day);

                    await onCreate(day, startHour);
                  }}
                  title="Cliquer pour créer un bloc de 1h"
                />

                {pairs.map((pair, pairIndex) => {
                  const startPos = getTimePosition(pair.entry.timestamp);

                  const startTime = extractTimeLocal(pair.entry.timestamp);

                  if (!pair.exit) {
                    console.log(
                      `🎯 Position orphelin ID ${pair.entry.id}: ${startPos}% à ${startTime}`,
                    );
                  }

                  if (pair.exit) {
                    const endPos = getTimePosition(pair.exit.timestamp);
                    const height = endPos - startPos;

                    const endTime = extractTimeLocal(pair.exit.timestamp);
                    const entryOutOfBounds = isOutOfBounds(
                      pair.entry.timestamp,
                    );
                    const exitOutOfBounds = isOutOfBounds(pair.exit.timestamp);
                    const hasOutOfBounds =
                      entryOutOfBounds.isOut || exitOutOfBounds.isOut;

                    const style = getTimesheetBlockStyle(pair.entry.status as TimesheetStatus);
                    const bgColorClass = style.bgColor;
                    const isDelay =
                      pair.entry.status === "retard" ||
                      pair.entry.status === "absence";

                    return (
                      <div
                        key={pairIndex}
                        className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 ${bgColorClass} ${style.textColor} rounded-md sm:rounded-lg p-1 sm:p-2 hover:shadow-lg transition-shadow group cursor-pointer ${hasOutOfBounds ? TIMELINE_UI_STYLES.outOfBounds.border : ""}`}
                        style={{
                          top: `${startPos}%`,
                          height: `${height}%`,
                          minHeight: "36px",
                          zIndex: 20,
                        }}
                        onClick={() => onEditPair(pair.entry, pair.exit)}
                        title={
                          isDelay
                            ? `🔶 RETARD ${hasOutOfBounds ? "- Bloc partiellement hors limites (6h-23h)" : ""}`
                            : hasOutOfBounds
                              ? `⚠️ Bloc partiellement hors limites (6h-23h)`
                              : undefined
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(pair.entry, pair.exit);
                          }}
                          className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 sm:w-5 sm:h-5 ${TIMELINE_UI_STYLES.deleteButton} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer`}
                          title="Supprimer le bloc"
                        >
                          <X size={12} className="sm:hidden" />
                          <X size={14} className="hidden sm:block" />
                        </button>

                        <div className="text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1">
                          {isDelay && <span title="Retard">🔶</span>}
                          {entryOutOfBounds.isOut && (
                            <span
                              className={TIMELINE_UI_STYLES.outOfBounds.iconColor}
                              title="Début hors limites"
                            >
                              ⬆
                            </span>
                          )}
                          <span className="truncate">{startTime}</span>
                          <span className="hidden sm:inline"> → </span>
                          <span className="sm:hidden">→</span>
                          <span className="truncate">{endTime}</span>
                          {exitOutOfBounds.isOut && (
                            <span
                              className={TIMELINE_UI_STYLES.outOfBounds.iconColor}
                              title="Fin hors limites"
                            >
                              ⬇
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    const isEntry = pair.entry.clockin;
                    const style = getOrphanBlockStyle(isEntry, pair.entry.status as TimesheetStatus);
                    const bgColor = style.bgColor;
                    const outOfBounds = isOutOfBounds(pair.entry.timestamp);

                    return (
                      <div
                        key={pairIndex}
                        className={`absolute left-0.5 right-0.5 sm:left-1 sm:right-1 ${bgColor} ${style.textColor} rounded-md sm:rounded-lg px-1 sm:px-2 py-0.5 sm:py-1 group cursor-pointer hover:opacity-80 transition-opacity ${outOfBounds.isOut ? TIMELINE_UI_STYLES.outOfBounds.border : ""}`}
                        style={{
                          top: `${startPos}%`,
                          height: "24px",
                          zIndex: 15,
                        }}
                        onClick={() => onEditPair(pair.entry)}
                        title={`Pointage ${isEntry ? "entrée" : "sortie"} orphelin - Cliquer pour modifier${outOfBounds.isOut ? ` - HORS LIMITES (${outOfBounds.position === "before" ? "avant 6h" : "après 23h"})` : ""}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(pair.entry);
                          }}
                          className={`absolute top-0.5 right-0.5 w-3 h-3 sm:w-4 sm:h-4 ${TIMELINE_UI_STYLES.deleteButton} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer`}
                          title="Supprimer le pointage"
                        >
                          <X size={8} className="sm:hidden" />
                          <X size={10} className="hidden sm:block" />
                        </button>

                        <div className="text-[9px] sm:text-xs italic flex items-center gap-0.5 sm:gap-1 truncate">
                          {outOfBounds.isOut && (
                            <span
                              className={`${TIMELINE_UI_STYLES.outOfBounds.iconColor} font-bold flex-shrink-0`}
                              title={
                                outOfBounds.position === "before"
                                  ? "Avant 6h"
                                  : "Après 23h"
                              }
                            >
                              {outOfBounds.position === "before" ? "⬆" : "⬇"}
                            </span>
                          )}
                          <span className="flex-shrink-0">{isEntry ? "→" : "←"}</span>
                          <span className="truncate">{startTime}</span>
                          <span className="hidden sm:inline truncate">{isEntry ? "(entrée seule)" : "(sortie seule)"}</span>
                        </div>
                      </div>
                    );
                  }
                })}

                {getAbsencesForDay(dateStr).map((absence, absenceIndex) => {
                  if (!teamHoraire) return null;

                  // Système HYBRIDE: TYPE détermine le fond, STATUT détermine la bordure
                  const absenceStyle = getAbsenceHybridStyle(
                    absence.type as AbsenceType,
                    absence.status as AbsenceStatus
                  );

                  const topPos = timeToPosition(teamHoraire.heureDebut);
                  const heightPos =
                    timeToPosition(teamHoraire.heureFin) - topPos;

                  return (
                    <div
                      key={`absence-${absenceIndex}`}
                      className={`absolute left-0 right-0 ${absenceStyle.textColor} rounded-md sm:rounded-lg p-1.5 sm:p-3 cursor-pointer hover:shadow-lg transition-shadow ${absenceStyle.bgColor} ${absenceStyle.borderColor}`}
                      style={{
                        top: `${topPos}%`,
                        height: `${heightPos}%`,
                        zIndex: 30,
                        opacity: 0.9,
                      }}
                      onClick={() => onAbsenceClick?.(absence)}
                      title={`Absence: ${getAbsenceTypeLabel(absence.type as AbsenceType)} - ${absence.status}`}
                    >
                      <div className="text-center">
                        <div className="text-[10px] sm:text-sm font-bold mb-0.5 sm:mb-1">ABSENCE</div>
                        <div className="text-[9px] sm:text-xs font-semibold leading-tight">
                          {getAbsenceTypeLabel(absence.type as AbsenceType)}
                        </div>
                        {absence.status === "en_attente" && (
                          <div className="text-[9px] sm:text-xs mt-0.5 sm:mt-1 font-medium">
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
