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

/**
 * Hook pour gérer les timesheets (remplace useTimeClock)
 * Utilise la nouvelle API /api/timesheets
 */
export function useTimesheet() {
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

  /**
   * Convertit une date ISO en DayKey
   */
  const dateToDayKey = (dateStr: string): DayKey => {
    const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  /**
   * Calcule les heures travaillées à partir d'une paire entrée/sortie
   */
  const calculateHours = (startISO: string, endISO: string): number => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convertir en heures
  };

  /**
   * Calcule les statistiques à partir des timesheets
   */
  const calculateStatsFromTimesheets = (timesheets: Timesheet[]): TimesheetStats => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Calculer le lundi de la semaine en cours
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    const mondayStr = monday.toISOString().split('T')[0];

    // Calculer le premier jour du mois
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let heuresJour = 0;
    let heuresSemaine = 0;
    let retardsMois = 0;

    // Grouper par date
    const byDate: Record<string, Timesheet[]> = {};
    timesheets.forEach(t => {
      if (!byDate[t.date]) byDate[t.date] = [];
      byDate[t.date].push(t);
    });

    // Calculer les heures pour chaque jour
    Object.entries(byDate).forEach(([date, dayTimesheets]) => {
      const sorted = [...dayTimesheets].sort((a, b) => {
        const aHour = a.hour || a.heure || '';
        const bHour = b.hour || b.heure || '';
        return aHour.localeCompare(bHour);
      });

      let dayHours = 0;

      // Créer des paires entrée/sortie
      for (let i = 0; i < sorted.length; i++) {
        const ts = sorted[i];
        if (ts.clockin === true) {
          const nextTs = sorted[i + 1];
          if (nextTs && nextTs.clockin === false) {
            const hours = calculateHours(ts.hour || ts.heure || '', nextTs.hour || nextTs.heure || '');
            console.log(`  ⏱️ ${date} - Paire ${ts.hour} → ${nextTs.hour} = ${hours.toFixed(2)}h`);
            dayHours += hours;
            i++; // Sauter le prochain
          } else if (date === today) {
            // Clock-in actif, calculer jusqu'à maintenant
            const hours = calculateHours(ts.hour || ts.heure || '', now.toISOString());
            console.log(`  ⏱️ ${date} - Clock-in actif ${ts.hour} → maintenant = ${hours.toFixed(2)}h`);
            dayHours += hours;
          }
        }
      }

      console.log(`  📊 ${date} - Total du jour: ${dayHours.toFixed(2)}h`);

      // Ajouter aux stats appropriées
      if (date === today) {
        heuresJour = dayHours;
        console.log(`  ✅ C'est aujourd'hui! heuresJour = ${heuresJour.toFixed(2)}h`);
      }
      if (date >= mondayStr) {
        heuresSemaine += dayHours;
        console.log(`  ✅ Dans la semaine! heuresSemaine = ${heuresSemaine.toFixed(2)}h`);
      }
      if (date >= firstDayOfMonth) {
        // Compter les retards (status === 'retard')
        const retards = sorted.filter(t => t.status === 'retard' && t.clockin === true);
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

  /**
   * Charge les statistiques
   */
  const loadStats = async () => {
    try {
      console.log('🔄 Chargement des statistiques...');

      // Toujours calculer côté frontend pour avoir les vraies valeurs
      const weekResponse = await getWeekTimesheets();
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

  /**
   * Charge les timesheets de la semaine et les transforme en TimeLog
   */
  const loadWeekTimesheets = async () => {
    try {
      const response = await getWeekTimesheets();

      if (!response.success || !response.data) {
        console.error('❌ Erreur chargement timesheets semaine:', response.error);
        return;
      }

      const weekTimesheets = response.data || [];

      // Vérification que c'est bien un array
      if (!Array.isArray(weekTimesheets)) {
        console.error('❌ weekTimesheets n\'est pas un array:', weekTimesheets);
        return;
      }

      // Réinitialiser les timeLogs
      const newTimeLogs: Record<DayKey, TimeLog[]> = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
      };

      // Grouper les timesheets par date
      const timesheetsByDate: Record<string, Timesheet[]> = {};
      weekTimesheets.forEach(t => {
        if (!timesheetsByDate[t.date]) {
          timesheetsByDate[t.date] = [];
        }
        timesheetsByDate[t.date].push(t);
      });

      console.log('📊 Timesheets groupés par date:', timesheetsByDate);

      // Transformer chaque jour
      Object.entries(timesheetsByDate).forEach(([date, timesheets]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        // Trier par heure (utiliser hour ou heure pour rétrocompatibilité)
        const sortedTimesheets = [...timesheets].sort((a, b) => {
          const aHour = a.hour || a.heure || '';
          const bHour = b.hour || b.heure || '';
          return aHour.localeCompare(bHour);
        });

        console.log(`🔍 Traitement du ${date} (${dayKey}):`, sortedTimesheets);

        // Créer des paires entrée/sortie
        for (let i = 0; i < sortedTimesheets.length; i++) {
          const timesheet = sortedTimesheets[i];

          if (timesheet.clockin === true) {
            // C'est une entrée, chercher la sortie correspondante
            const nextTimesheet = sortedTimesheets[i + 1];

            // Extraire l'heure du format ISO "2025-10-24T08:30:00.000Z" -> "08:30"
            const hourISO = timesheet.hour || timesheet.heure;
            const start = hourISO ? new Date(hourISO).toTimeString().substring(0, 5) : '00:00';

            console.log(`  ➡️ Entrée trouvée à ${start}`);

            if (nextTimesheet && nextTimesheet.clockin === false) {
              // Paire complète
              const nextHourISO = nextTimesheet.hour || nextTimesheet.heure;
              const end = nextHourISO ? new Date(nextHourISO).toTimeString().substring(0, 5) : '00:00';
              dayLogs.push({ start, end });
              console.log(`  ✅ Paire complète: ${start} - ${end}`);
              i++; // Sauter le prochain timesheet car déjà traité
            } else {
              // Entrée sans sortie (pointage en cours ou incomplet)
              console.log(`  ⏳ Entrée sans sortie (en cours ou incomplet)`);
            }
          }
        }

        console.log(`📝 Logs pour ${dayKey}:`, dayLogs);
        newTimeLogs[dayKey] = dayLogs;
      });

      setTimeLogs(newTimeLogs);
      console.log('✅ Timesheets de la semaine chargés:', newTimeLogs);
    } catch (error) {
      console.error('❌ Erreur chargement timesheets semaine:', error);
    }
  };

  /**
   * Vérifie les timesheets du jour au chargement pour restaurer l'état
   */
  const checkTodayTimesheets = async () => {
    try {
      // Charger tous les timesheets de la semaine
      await loadWeekTimesheets();

      // Charger les stats
      await loadStats();

      // Vérifier le statut du jour actuel
      const response = await getTodayTimesheets();

      if (!response.success || !response.data) {
        console.log('⚠️ Aucun timesheet aujourd\'hui');
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
        return;
      }

      const todayTimesheets = response.data;

      // Trouver le DERNIER timesheet pour déterminer l'état actuel
      if (todayTimesheets.length > 0) {
        // Trier par heure pour avoir le dernier timesheet
        const sortedTimesheets = [...todayTimesheets].sort((a, b) => {
          const aHour = a.hour || a.heure || '';
          const bHour = b.hour || b.heure || '';
          return aHour.localeCompare(bHour);
        });
        const lastTimesheet = sortedTimesheets[sortedTimesheets.length - 1];

        // Si le dernier timesheet est une entrée (clockin === true), on est en train de pointer
        if (lastTimesheet.clockin === true) {
          setLastClockIn(lastTimesheet);
          setIsClockingIn(true);
          const hourISO = lastTimesheet.hour || lastTimesheet.heure;
          const time = hourISO ? new Date(hourISO).toTimeString().substring(0, 5) : '00:00';
          setCurrentDayLogs({ start: time });
          console.log('✅ Statut: pointé depuis', time);
        } else {
          // Le dernier timesheet est une sortie, on n'est pas en train de pointer
          setLastClockIn(null);
          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
          console.log('✅ Statut: non pointé');
        }
      } else {
        // Aucun timesheet aujourd'hui
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
        console.log('✅ Statut: aucun pointage aujourd\'hui');
      }
    } catch (error) {
      console.error('❌ Erreur vérification timesheets:', error);
    }
  };

  /**
   * Gère à la fois Clock In et Clock Out avec la même fonction
   * L'API backend détermine automatiquement s'il faut faire un clock in ou un clock out
   */
  const handleClockToggle = async () => {
    // Empêcher les clics multiples pendant le traitement
    if (pointageLoading) {
      console.log('⚠️ Pointage déjà en cours, ignoré');
      return;
    }

    try {
      setPointageLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await clockInOut();

      console.log('📦 Réponse clockInOut:', response);

      if (response.success && response.data) {
        console.log('✅ Data reçue:', response.data);

        // L'API retourne 'hour' au format ISO "2025-10-24T15:30:00.000Z"
        const hourISO = response.data.hour || response.data.heure;
        const time = hourISO ? new Date(hourISO).toTimeString().substring(0, 5) : '00:00';

        console.log(`⏰ Heure extraite: ${time}, clockin: ${response.data.clockin}`);

        // Si clockin === true → C'est une entrée
        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');
          console.log('🟢 État mis à jour: isClockingIn = true, start =', time);

          // Recharger les stats pour afficher le temps en cours
          setTimeout(() => {
            loadStats();
          }, 100);
        }
        // Si clockin === false → C'est une sortie
        else {
          console.log('🔵 Pointage de sortie détecté, mise à jour de l\'état...');

          // Mettre à jour l'état immédiatement
          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
          setLastClockIn(null);
          setSuccessMessage('✅ Pointage de sortie enregistré avec succès !');
          console.log('🔴 État mis à jour: isClockingIn = false');

          // Recharger les données en arrière-plan (sans bloquer l'UI)
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

  return {
    timeLogs,
    isClockingIn,
    currentDayLogs,
    pointageLoading,
    successMessage,
    errorMessage,
    lastClockIn,
    stats,
    getDayKey,
    handleClockToggle,
    checkTodayTimesheets,
    loadWeekTimesheets,
    loadStats
  };
}
