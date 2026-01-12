import { useState, useEffect } from 'react';
import { DayKey, TimeLog } from '../types';
import {
  clockInOut,
  getTodayTimesheets,
  getWeekTimesheets,
  getTimesheetStats,
  isCurrentlyClockedIn,
  Timesheet,
  TimesheetStats
} from '../services/timesheetService';
import { extractTimeLocal } from '@/app/utils/dateUtils';

export function useTimesheet() {
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [weekTimesheets, setWeekTimesheets] = useState<Timesheet[]>([]);
  const [timeLogs, setTimeLogs] = useState<Record<DayKey, TimeLog[]>>({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: []
  });
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [currentDayLogs, setCurrentDayLogs] = useState<TimeLog>({ start: '' });
  const [pointageLoading, setPointageLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [lastClockIn, setLastClockIn] = useState<Timesheet | null>(null);
  const [stats, setStats] = useState<TimesheetStats>({
    heuresJour: 0,
    heuresSemaine: 0,
    retardsMois: 0,
    moyenneHebdo: 0
  });

  const getDayKey = (): DayKey => {
    const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  const dateToDayKey = (dateStr: string): DayKey => {
    const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  const calculateHours = (startISO: string, endISO: string, date?: string): number => {
    let start: Date;
    let end: Date;

    if (startISO.includes('T')) {

      start = new Date(startISO);
      end = new Date(endISO);
    } else {

      const baseDate = date || new Date().toISOString().split('T')[0];
      start = new Date(`${baseDate}T${startISO}`);
      end = new Date(`${baseDate}T${endISO}`);
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    if (hours < 0 || hours > 24) {
      return 0;
    }

    return hours;
  };

  const calculateStatsFromTimesheets = (timesheets: Timesheet[]): TimesheetStats => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let heuresJour = 0;
    let heuresSemaine = 0;
    let retardsMois = 0;

    const byDate: Record<string, Timesheet[]> = {};
    timesheets.forEach(t => {
      const date = t.timestamp.substring(0, 10);
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(t);
    });


    Object.entries(byDate).forEach(([date, dayTimesheets]) => {
      const sorted = [...dayTimesheets].sort((a, b) => {
        return a.timestamp.localeCompare(b.timestamp);
      });

      let dayHours = 0;

      for (let i = 0; i < sorted.length; i++) {
        const ts = sorted[i];
        if (ts.clockin === true) {
          const nextTs = sorted[i + 1];
          if (nextTs && nextTs.clockin === false) {
            const hours = calculateHours(ts.timestamp, nextTs.timestamp);
            dayHours += hours;
            i++;
          } else if (date === today) {

            const hours = calculateHours(ts.timestamp, now.toISOString());
            dayHours += hours;
          }
        }
      }


      if (date === today) {
        heuresJour = dayHours;
      }

      heuresSemaine += dayHours;

      if (date >= firstDayOfMonth) {
        // Compter les retards (clockin uniquement)
        const retards = sorted.filter(t => {
          const isRetard = (t.status === 'retard' || t.status === 'delay') && t.clockin === true;
          return isRetard;
        });
        retardsMois += retards.length;
      }
    });


    return {
      heuresJour,
      heuresSemaine,
      retardsMois,
      moyenneHebdo: heuresSemaine / 7
    };
  };

  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  const loadStats = async () => {
    try {

      const monday = getMonday(selectedWeek);
      const weekResponse = await getWeekTimesheets(monday);
      if (weekResponse.success && weekResponse.data) {
        const calculatedStats = calculateStatsFromTimesheets(weekResponse.data);
        setStats(calculatedStats);
      } else {
        // Warning: Impossible de récupérer les timesheets
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadWeekTimesheets = async (): Promise<Timesheet[]> => {
    try {
      const monday = getMonday(selectedWeek);
      const response = await getWeekTimesheets(monday);

      if (!response.success || !response.data) {
        return [];
      }

      const weekTimesheetsData = response.data || [];

      if (!Array.isArray(weekTimesheetsData)) {
        return [];
      }

      setWeekTimesheets(weekTimesheetsData);

      const newTimeLogs: Record<DayKey, TimeLog[]> = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
      };

      const timesheetsByDate: Record<string, Timesheet[]> = {};
      weekTimesheetsData.forEach(t => {
        const date = t.timestamp.substring(0, 10);
        if (!timesheetsByDate[date]) {
          timesheetsByDate[date] = [];
        }
        timesheetsByDate[date].push(t);
      });


      Object.entries(timesheetsByDate).forEach(([date, timesheets]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        const sortedTimesheets = [...timesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });


        for (let i = 0; i < sortedTimesheets.length; i++) {
          const timesheet = sortedTimesheets[i];

          if (timesheet.clockin === true) {

            const nextTimesheet = sortedTimesheets[i + 1];

            const start = extractTimeLocal(timesheet.timestamp);


            if (nextTimesheet && nextTimesheet.clockin === false) {

              const end = extractTimeLocal(nextTimesheet.timestamp);
              const normalizedStatus = timesheet.status === 'delay' ? 'retard' : timesheet.status;
              dayLogs.push({ start, end, status: normalizedStatus });
              i++;
            } else {

            }
          }
        }

        newTimeLogs[dayKey] = dayLogs;
      });

      setTimeLogs(newTimeLogs);
      return weekTimesheetsData;
    } catch (error) {
      return [];
    }
  };

  const checkTodayTimesheets = async (timesheetsData?: Timesheet[]) => {
    try {
      const today = new Date();
      const selectedMonday = getMonday(selectedWeek);
      const currentMonday = getMonday(today);

      const isCurrentWeek = selectedMonday.toDateString() === currentMonday.toDateString();

      if (!isCurrentWeek) {
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
        return;
      }

      const timesheetsToUse = timesheetsData || weekTimesheets;
      const todayStr = today.toISOString().split('T')[0];

      const todayTimesheets = timesheetsToUse.filter(t => {
        const tsDate = t.timestamp.substring(0, 10);
        return tsDate === todayStr;
      });


      if (todayTimesheets.length > 0) {
        const sortedTimesheets = [...todayTimesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });
        const lastTimesheet = sortedTimesheets[sortedTimesheets.length - 1];

        if (lastTimesheet.clockin === true) {
          setLastClockIn(lastTimesheet);
          setIsClockingIn(true);
          const time = extractTimeLocal(lastTimesheet.timestamp);
          setCurrentDayLogs({ start: time });
        } else {
          setLastClockIn(null);
          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
        }
      } else {
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
      }
    } catch (error) {
      // Silent error
    }
  };

  const handleClockToggle = async () => {

    if (pointageLoading) {
      return;
    }

    try {
      setPointageLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const today = new Date();
      const currentMonday = getMonday(today);
      const selectedMonday = getMonday(selectedWeek);

      if (currentMonday.toDateString() !== selectedMonday.toDateString()) {
        setSelectedWeek(today);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const response = await clockInOut();


      if (response.success && response.data) {

        const time = response.data.timestamp ? extractTimeLocal(response.data.timestamp) : '00:00';


        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');

          setTimeout(() => {
            loadStats();
          }, 100);
        }

        else {

          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
          setLastClockIn(null);
          setSuccessMessage('✅ Pointage de sortie enregistré avec succès !');

          setTimeout(() => {
            loadWeekTimesheets();
            loadStats();
          }, 100);
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || '❌ Erreur lors du pointage');
      }
    } catch (error) {
      setErrorMessage('❌ Erreur lors du pointage : ' + (error as Error).message);
    } finally {
      setPointageLoading(false);
    }
  };

  useEffect(() => {
    const monday = getMonday(selectedWeek);
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      day.setHours(0, 0, 0, 0);
      return day;
    });
    setWeekDays(days);

    const today = new Date();
    const currentMonday = getMonday(today);
    const isCurrentWeek = monday.toDateString() === currentMonday.toDateString();

    if (!isCurrentWeek) {
      setIsClockingIn(false);
      setCurrentDayLogs({ start: '' });
      setLastClockIn(null);
    }

    const loadData = async () => {
      const timesheets = await loadWeekTimesheets();
      await loadStats();

      if (isCurrentWeek) {
        await checkTodayTimesheets(timesheets);
      }
    };

    loadData();
  }, [selectedWeek]);

  const previousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const currentWeek = () => {
    setSelectedWeek(new Date());
  };

  const formatWeekRange = (): string => {
    const monday = getMonday(selectedWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const selectedMonday = getMonday(selectedWeek);
    const currentMonday = getMonday(today);
    return selectedMonday.toDateString() === currentMonday.toDateString();
  };

  const formatWeekButtonText = (): string => {
    if (isCurrentWeek()) {
      return 'Cette semaine';
    }
    const monday = getMonday(selectedWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `Semaine du ${monday.getDate()}/${monday.getMonth() + 1} au ${sunday.getDate()}/${sunday.getMonth() + 1}`;
  };

  return {
    timeLogs,
    isClockingIn,
    currentDayLogs,
    pointageLoading,
    successMessage,
    errorMessage,
    lastClockIn,
    stats,
    selectedWeek,
    weekDays,
    getDayKey,
    handleClockToggle,
    checkTodayTimesheets,
    loadWeekTimesheets,
    loadStats,
    previousWeek,
    nextWeek,
    currentWeek,
    formatWeekRange,
    isCurrentWeek,
    formatWeekButtonText
  };
}

