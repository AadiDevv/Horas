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
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
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
  const calculateHours = (startISO: string, endISO: string, date?: string): number => {
    let start: Date;
    let end: Date;

    // Vérifier si startISO est un timestamp complet ou juste une heure
    if (startISO.includes('T')) {
      // Format complet ISO "2025-10-24T08:30:00.000Z"
      start = new Date(startISO);
      end = new Date(endISO);
    } else {
      // Format heure seule "08:30:00" ou "08:30"
      // Utiliser la date fournie ou aujourd'hui
      const baseDate = date || new Date().toISOString().split('T')[0];
      start = new Date(`${baseDate}T${startISO}`);
      end = new Date(`${baseDate}T${endISO}`);
    }

    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60); // Convertir en heures

    // Si le résultat est négatif ou absurde (> 24h), retourner 0
    if (hours < 0 || hours > 24) {
      console.warn(`⚠️ Calcul d'heures invalide: ${startISO} → ${endISO} = ${hours}h`);
      return 0;
    }

    return hours;
  };

  /**
   * Calcule les statistiques à partir des timesheets
   * Les stats sont calculées pour TOUTE la semaine, peu importe le jour actuel
   */
  const calculateStatsFromTimesheets = (timesheets: Timesheet[]): TimesheetStats => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Calculer le premier jour du mois pour les retards
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let heuresJour = 0;
    let heuresSemaine = 0;
    let retardsMois = 0;

    // Grouper par date (extraite du timestamp)
    const byDate: Record<string, Timesheet[]> = {};
    timesheets.forEach(t => {
      const date = t.timestamp.substring(0, 10); // "YYYY-MM-DD"
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(t);
    });

    console.log('📊 Calcul des stats pour les dates:', Object.keys(byDate));
    console.log('📅 Aujourd\'hui:', today);

    // Calculer les heures pour chaque jour
    Object.entries(byDate).forEach(([date, dayTimesheets]) => {
      const sorted = [...dayTimesheets].sort((a, b) => {
        return a.timestamp.localeCompare(b.timestamp);
      });

      let dayHours = 0;

      // Créer des paires entrée/sortie
      for (let i = 0; i < sorted.length; i++) {
        const ts = sorted[i];
        if (ts.clockin === true) {
          const nextTs = sorted[i + 1];
          if (nextTs && nextTs.clockin === false) {
            const hours = calculateHours(ts.timestamp, nextTs.timestamp);
            console.log(`  ⏱️ ${date} - Paire ${ts.timestamp} → ${nextTs.timestamp} = ${hours.toFixed(2)}h`);
            dayHours += hours;
            i++; // Sauter le prochain
          } else if (date === today) {
            // Clock-in actif aujourd'hui, calculer jusqu'à maintenant
            const hours = calculateHours(ts.timestamp, now.toISOString());
            console.log(`  ⏱️ ${date} - Clock-in actif ${ts.timestamp} → maintenant = ${hours.toFixed(2)}h`);
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

      // Ajouter TOUTES les heures à la semaine (pas de filtre par date)
      heuresSemaine += dayHours;
      console.log(`  ✅ Ajout à heuresSemaine: ${dayHours.toFixed(2)}h, total = ${heuresSemaine.toFixed(2)}h`);

      if (date >= firstDayOfMonth) {
        // Compter les retards (status === 'retard')
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

  /**
   * Calcule le lundi de la semaine pour une date donnée
   */
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  /**
   * Charge les statistiques
   */
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

  /**
   * Charge les timesheets de la semaine et les transforme en TimeLog
   */
  const loadWeekTimesheets = async () => {
    try {
      const monday = getMonday(selectedWeek);
      const response = await getWeekTimesheets(monday);

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

      // Grouper les timesheets par date (extraite du timestamp)
      const timesheetsByDate: Record<string, Timesheet[]> = {};
      weekTimesheets.forEach(t => {
        const date = t.timestamp.substring(0, 10); // "YYYY-MM-DD"
        if (!timesheetsByDate[date]) {
          timesheetsByDate[date] = [];
        }
        timesheetsByDate[date].push(t);
      });

      console.log('📊 Timesheets groupés par date:', timesheetsByDate);

      // Transformer chaque jour
      Object.entries(timesheetsByDate).forEach(([date, timesheets]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        // Trier par timestamp
        const sortedTimesheets = [...timesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });

        console.log(`🔍 Traitement du ${date} (${dayKey}):`, sortedTimesheets);

        // Créer des paires entrée/sortie
        for (let i = 0; i < sortedTimesheets.length; i++) {
          const timesheet = sortedTimesheets[i];

          if (timesheet.clockin === true) {
            // C'est une entrée, chercher la sortie correspondante
            const nextTimesheet = sortedTimesheets[i + 1];

            // Extraire l'heure du format ISO "2025-12-13T08:30:00.000Z" -> "08:30"
            const start = timesheet.timestamp ? new Date(timesheet.timestamp).toTimeString().substring(0, 5) : '00:00';

            console.log(`  ➡️ Entrée trouvée à ${start}`);

            if (nextTimesheet && nextTimesheet.clockin === false) {
              // Paire complète
              const end = nextTimesheet.timestamp ? new Date(nextTimesheet.timestamp).toTimeString().substring(0, 5) : '00:00';
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
   * Met à jour l'état de clock in/out UNIQUEMENT si on regarde la semaine en cours
   */
  const checkTodayTimesheets = async () => {
    try {
      // Charger tous les timesheets de la semaine
      await loadWeekTimesheets();

      // Charger les stats
      await loadStats();

      // Vérifier si selectedWeek est la semaine en cours
      const today = new Date();
      const selectedMonday = getMonday(selectedWeek);
      const currentMonday = getMonday(today);

      const isCurrentWeek = selectedMonday.toDateString() === currentMonday.toDateString();

      // Si on ne regarde pas la semaine en cours, réinitialiser l'état
      if (!isCurrentWeek) {
        console.log('📅 Semaine sélectionnée n\'est pas la semaine en cours, pas de clock-in actif');
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
        return;
      }

      // Vérifier le statut du jour actuel (seulement si on regarde la semaine en cours)
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
        // Trier par timestamp pour avoir le dernier timesheet
        const sortedTimesheets = [...todayTimesheets].sort((a, b) => {
          return a.timestamp.localeCompare(b.timestamp);
        });
        const lastTimesheet = sortedTimesheets[sortedTimesheets.length - 1];

        // Si le dernier timesheet est une entrée (clockin === true), on est en train de pointer
        if (lastTimesheet.clockin === true) {
          setLastClockIn(lastTimesheet);
          setIsClockingIn(true);
          const time = lastTimesheet.timestamp ? new Date(lastTimesheet.timestamp).toTimeString().substring(0, 5) : '00:00';
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

      // S'assurer qu'on est sur la semaine en cours avant de pointer
      const today = new Date();
      const currentMonday = getMonday(today);
      const selectedMonday = getMonday(selectedWeek);

      if (currentMonday.toDateString() !== selectedMonday.toDateString()) {
        console.log('📅 Retour à la semaine en cours pour pointer');
        setSelectedWeek(today);
        // Attendre un peu pour que l'état se mette à jour
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const response = await clockInOut();

      console.log('📦 Réponse clockInOut:', response);

      if (response.success && response.data) {
        console.log('✅ Data reçue:', response.data);

        // L'API retourne 'timestamp' au format ISO "2025-12-13T15:30:00.000Z"
        const time = response.data.timestamp ? new Date(response.data.timestamp).toTimeString().substring(0, 5) : '00:00';

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

  // Recharger les données quand la semaine change
  useEffect(() => {
    const monday = getMonday(selectedWeek);
    const days = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      day.setHours(0, 0, 0, 0);
      return day;
    });
    setWeekDays(days);

    // Vérifier si c'est la semaine en cours pour gérer le clock-in actif
    const today = new Date();
    const currentMonday = getMonday(today);
    const isCurrentWeek = monday.toDateString() === currentMonday.toDateString();

    if (!isCurrentWeek) {
      // Si on change pour une autre semaine, réinitialiser l'état de clock-in
      setIsClockingIn(false);
      setCurrentDayLogs({ start: '' });
      setLastClockIn(null);
    }

    loadWeekTimesheets();
    loadStats();
  }, [selectedWeek]);

  /**
   * Navigation entre les semaines
   */
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

  /**
   * Formate la plage de dates de la semaine
   */
  const formatWeekRange = (): string => {
    const monday = getMonday(selectedWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  /**
   * Vérifie si la semaine sélectionnée est la semaine en cours
   */
  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const selectedMonday = getMonday(selectedWeek);
    const currentMonday = getMonday(today);
    return selectedMonday.toDateString() === currentMonday.toDateString();
  };

  /**
   * Formate le texte du bouton semaine (affiche "Cette semaine" ou la plage de dates)
   */
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
