import { useState } from 'react';
import { DayKey, TimeLog, User, UserFormData, Horaire, PointageReadDTO } from '../types';
import { getUser, updateUser, changePassword } from '../services/userService';
import { getEquipeHoraires } from '../services/equipeService';

export { useTimesheet } from './useTimesheet';

export function useUserData() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UserFormData>({
    prenom: '',
    nom: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadUserData = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('❌ Utilisateur non connecté (localStorage vide)');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;

      const response = await getUser(userId);

      if (response.success && response.data) {
        setUserData(response.data);
        setFormData({
          prenom: response.data.prenom,
          nom: response.data.nom,
          email: response.data.email,
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    setUserData,
    loading,
    formData,
    setFormData,
    loadUserData
  };
}

export function useSettings(userData: User | null, formData: UserFormData) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenSettings = () => {
    if (userData) {
      setSuccessMessage('');
      setErrorMessage('');
      setSettingsOpen(true);
    }
  };

  const handleSaveSettings = async (
    setUserData: (user: User) => void
  ) => {
    if (!userData) return;

    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');

      const response = await updateUser(userData.id, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      });

      if (response.success && response.data) {
        setUserData(response.data);
        setSuccessMessage('✅ Informations modifiées avec succès !');

        setTimeout(() => {
          setSettingsOpen(false);
          setSuccessMessage('');
          setErrorMessage('');
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setErrorMessage('❌ Erreur lors de la sauvegarde : ' + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return {
    settingsOpen,
    setSettingsOpen,
    saving,
    successMessage,
    errorMessage,
    handleOpenSettings,
    handleSaveSettings
  };
}

export function useTeamSchedule(userData: User | null) {
  const [teamSchedule, setTeamSchedule] = useState<Horaire[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeamSchedule = async () => {
    if (!userData?.equipeId) {
      console.log('⚠️ Aucune équipe associée à l\'utilisateur');
      setTeamSchedule([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getEquipeHoraires(userData.equipeId);

      if (response.success && response.data) {
        setTeamSchedule(response.data);
        console.log('✅ Horaires de l\'équipe chargés:', response.data);
      } else {
        console.error('❌ Erreur chargement horaires:', response.message);
        setTeamSchedule([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement horaires équipe:', error);
      setTeamSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    teamSchedule,
    loading,
    loadTeamSchedule
  };
}

export function useTimeClock() {
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
  const [lastClockIn, setLastClockIn] = useState<TimesheetReadDTO | null>(null);

  const getDayKey = (): DayKey => {
    const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  const dateToDayKey = (dateStr: string): DayKey => {
    const days: DayKey[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr + 'T00:00:00');
    return days[date.getDay()];
  };

  const loadWeekPointages = async () => {
    try {
      const { getWeekPointages } = await import('../services/pointageService');
      const weekPointages = await getWeekPointages();

      const newTimeLogs: Record<DayKey, TimeLog[]> = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: []
      };

      const pointagesByDate: Record<string, typeof weekPointages> = {};
      weekPointages.forEach(p => {
        const date = p.timestamp.substring(0, 10);
        if (!pointagesByDate[date]) {
          pointagesByDate[date] = [];
        }
        pointagesByDate[date].push(p);
      });

      console.log('📊 Pointages groupés par date:', pointagesByDate);

      Object.entries(pointagesByDate).forEach(([date, pointages]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        const sortedPointages = [...pointages].sort((a, b) =>
          a.heure.localeCompare(b.heure)
        );

        console.log(`🔍 Traitement du ${date} (${dayKey}):`, sortedPointages);

        for (let i = 0; i < sortedPointages.length; i++) {
          const pointage = sortedPointages[i];

          if (pointage.clockin === true) {

            const nextPointage = sortedPointages[i + 1];
            const start = pointage.heure.substring(0, 5);

            console.log(`  ➡️ Entrée trouvée à ${start}`);

            if (nextPointage && nextPointage.clockin === false) {

              const end = nextPointage.heure.substring(0, 5);
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
      console.log('✅ Pointages de la semaine chargés:', newTimeLogs);
    } catch (error) {
      console.error('❌ Erreur chargement pointages semaine:', error);
    }
  };

  const checkTodayPointages = async () => {
    try {

      await loadWeekPointages();

      const { getTodayPointages } = await import('../services/pointageService');
      const todayPointages = await getTodayPointages();

      if (todayPointages.length > 0) {

        const sortedPointages = [...todayPointages].sort((a, b) =>
          a.heure.localeCompare(b.heure)
        );
        const lastPointage = sortedPointages[sortedPointages.length - 1];

        if (lastPointage.clockin === true) {
          setLastClockIn(lastPointage);
          setIsClockingIn(true);
          const time = lastPointage.heure.substring(0, 5);
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
      console.error('❌ Erreur vérification pointages:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      setPointageLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { clockIn } = await import('../services/pointageService');
      const response = await clockIn();

      if (response.success && response.data) {
        const time = response.data.heure.substring(0, 5);

        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');
        }

        else {

          await loadWeekPointages();

          await new Promise(resolve => setTimeout(resolve, 300));

          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
          setLastClockIn(null);
          setSuccessMessage('✅ Pointage de sortie enregistré avec succès !');
        }

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.error || '❌ Erreur lors du pointage');
      }
    } catch (error) {
      console.error('❌ Erreur pointage:', error);
      setErrorMessage('❌ Erreur lors du pointage : ' + (error as Error).message);
    } finally {
      setPointageLoading(false);
    }
  };

  const handleClockOut = handleClockIn;

  return {
    timeLogs,
    isClockingIn,
    currentDayLogs,
    pointageLoading,
    successMessage,
    errorMessage,
    lastClockIn,
    getDayKey,
    handleClockIn,
    handleClockOut,
    checkTodayPointages,
    loadWeekPointages
  };
}
