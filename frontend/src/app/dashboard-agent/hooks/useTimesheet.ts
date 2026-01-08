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
      console.warn(`⚠️ Calcul d'heures invalide: ${startISO} → ${endISO} = ${hours}h`);
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

    console.log('📊 Calcul des stats pour les dates:', Object.keys(byDate));
    console.log('📅 Aujourd\'hui:', today);

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
            console.log(`  ⏱️ ${date} - Paire ${ts.timestamp} → ${nextTs.timestamp} = ${hours.toFixed(2)}h`);
            dayHours += hours;
            i++;
          } else if (date === today) {

            const hours = calculateHours(ts.timestamp, now.toISOString());
            console.log(`  ⏱️ ${date} - Clock-in actif ${ts.timestamp} → maintenant = ${hours.toFixed(2)}h`);
            dayHours += hours;
          }
        }
      }

      console.log(`  📊 ${date} - Total du jour: ${dayHours.toFixed(2)}h`);

      if (date === today) {
        heuresJour = dayHours;
        console.log(`  ✅ C'est aujourd'hui! heuresJour = ${heuresJour.toFixed(2)}h`);
      }

      heuresSemaine += dayHours;
      console.log(`  ✅ Ajout à heuresSemaine: ${dayHours.toFixed(2)}h, total = ${heuresSemaine.toFixed(2)}h`);

      if (date >= firstDayOfMonth) {

        const retards = sorted.filter(t => t.status === 'retard' && t.clockin === true);
        retardsMois += retards.length;
      }
    });

    console.log('📈 Stats finales:', {
      heuresJour,
      heuresSemaine,
      retardsMois,
      moyenneHebdo: heuresSemaine / 7
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
      console.log('🔄 Chargement des statistiques...');

      const monday = getMonday(selectedWeek);
      const weekResponse = await getWeekTimesheets(monday);
      if (weekResponse.success && weekResponse.data) {
        console.log('📊 Calcul des stats à partir de', weekResponse.data.length, 'timesheets');
        const calculatedStats = calculateStatsFromTimesheets(weekResponse.data);
        setStats(calculatedStats);
        console.log('✅ Statistiques calculées:', calculatedStats);
      } else {
        console.warn('⚠️ Impossible de récupérer les timesheets');
      }
    } catch (error) {
      console.error('❌ Erreur loadStats:', error);
    }
  };

  const loadWeekTimesheets = async (): Promise<Timesheet[]> => {
    try {
      const monday = getMonday(selectedWeek);
      const response = await getWeekTimesheets(monday);

      if (!response.success || !response.data) {
        console.error('❌ Erreur chargement timesheets semaine:', response.error);
        return [];
      }

      const weekTimesheetsData = response.data || [];

      if (!Array.isArray(weekTimesheetsData)) {
        console.error('❌ weekTimesheets n\'est pas un array:', weekTimesheetsData);
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

      console.log('📊 Timesheets groupés par date:', timesheetsByDate);

      Object.entries(timesheetsByDate).forEach(([date, timesheets]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        const sortedTimesheets = [...timesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });

        console.log(`🔍 Traitement du ${date} (${dayKey}):`, sortedTimesheets);

        for (let i = 0; i < sortedTimesheets.length; i++) {
          const timesheet = sortedTimesheets[i];

          if (timesheet.clockin === true) {

            const nextTimesheet = sortedTimesheets[i + 1];

            const start = timesheet.timestamp ? new Date(timesheet.timestamp).toTimeString().substring(0, 5) : '00:00';

            console.log(`  ➡️ Entrée trouvée à ${start}`);

            if (nextTimesheet && nextTimesheet.clockin === false) {

              const end = nextTimesheet.timestamp ? new Date(nextTimesheet.timestamp).toTimeString().substring(0, 5) : '00:00';
              dayLogs.push({ start, end });
              console.log(`  ✅ Paire complète: ${start} - ${end}`);
              i++;
            } else {

              console.log(`  ⏳ Entrée sans sortie (en cours ou incomplet)`);
            }
          }
        }

        console.log(`📝 Logs pour ${dayKey}:`, dayLogs);
        newTimeLogs[dayKey] = dayLogs;
      });

      setTimeLogs(newTimeLogs);
      console.log('✅ Timesheets de la semaine chargés:', newTimeLogs);
      return weekTimesheetsData;
    } catch (error) {
      console.error('❌ Erreur chargement timesheets semaine:', error);
      return [];
    }
  };

  const checkTodayTimesheets = async (timesheetsData?: Timesheet[]) => {
    try {
      console.log('🔍 checkTodayTimesheets - DEBUT');
      const today = new Date();
      const selectedMonday = getMonday(selectedWeek);
      const currentMonday = getMonday(today);

      const isCurrentWeek = selectedMonday.toDateString() === currentMonday.toDateString();
      console.log('📅 isCurrentWeek:', isCurrentWeek);

      if (!isCurrentWeek) {
        console.log('⚠️ Pas la semaine en cours, reset states');
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
        return;
      }

      const timesheetsToUse = timesheetsData || weekTimesheets;
      const todayStr = today.toISOString().split('T')[0];
      console.log('📅 Recherche des timesheets pour:', todayStr);
      console.log('📦 Timesheets disponibles:', timesheetsToUse.length);

      const todayTimesheets = timesheetsToUse.filter(t => {
        const tsDate = t.timestamp.substring(0, 10);
        return tsDate === todayStr;
      });

      console.log(`📊 ${todayTimesheets.length} timesheets trouvés pour aujourd'hui:`, todayTimesheets);

      if (todayTimesheets.length > 0) {
        const sortedTimesheets = [...todayTimesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });
        const lastTimesheet = sortedTimesheets[sortedTimesheets.length - 1];
        console.log('🔍 Dernier timesheet:', lastTimesheet);
        console.log('🔍 lastTimesheet.clockin:', lastTimesheet.clockin);

        if (lastTimesheet.clockin === true) {
          console.log('✅ Clock-in actif détecté!');
          setLastClockIn(lastTimesheet);
          setIsClockingIn(true);
          const time = lastTimesheet.timestamp ? new Date(lastTimesheet.timestamp).toTimeString().substring(0, 5) : '00:00';
          setCurrentDayLogs({ start: time });
          console.log('✅ States mis à jour: isClockingIn=true, start=', time);
        } else {
          console.log('ℹ️ Dernier timesheet est un clock-out');
          setLastClockIn(null);
          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
        }
      } else {
        console.log('ℹ️ Aucun timesheet aujourd\'hui');
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
      }
      console.log('🔍 checkTodayTimesheets - FIN');
    } catch (error) {
      console.error('❌ Erreur vérification timesheets:', error);
    }
  };

  const handleClockToggle = async () => {

    if (pointageLoading) {
      console.log('⚠️ Pointage déjà en cours, ignoré');
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
        console.log('📅 Retour à la semaine en cours pour pointer');
        setSelectedWeek(today);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const response = await clockInOut();

      console.log('📦 Réponse clockInOut:', response);

      if (response.success && response.data) {
        console.log('✅ Data reçue:', response.data);

        const time = response.data.timestamp ? new Date(response.data.timestamp).toTimeString().substring(0, 5) : '00:00';

        console.log(`⏰ Heure extraite: ${time}, clockin: ${response.data.clockin}`);

        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');
          console.log('🟢 État mis à jour: isClockingIn = true, start =', time);

          setTimeout(() => {
            loadStats();
          }, 100);
        }

        else {
          console.log('🔵 Pointage de sortie détecté, mise à jour de l\'état...');

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
        console.error('❌ Erreur dans la réponse:', response);
        setErrorMessage(response.error || '❌ Erreur lors du pointage');
      }
    } catch (error) {
      console.error('❌ Erreur pointage:', error);
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
