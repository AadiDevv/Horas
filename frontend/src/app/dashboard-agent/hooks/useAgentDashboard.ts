import { useState } from 'react';
import { DayKey, TimeLog, User, UserFormData, Horaire } from '../types';
import { getUser, updateUser, changePassword } from '../services/userService';
import { getEquipeHoraires } from '../services/equipeService';

// Export du nouveau hook timesheet
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
      const userId = 1; // TODO: Get from auth context
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
    setUserData: (user: User) => void,
    setFormData: (data: UserFormData) => void
  ) => {
    if (!userData) return;

    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      const wantsToChangePassword = formData.newPassword || formData.confirmPassword || formData.oldPassword;
      
      if (wantsToChangePassword) {
        if (!formData.oldPassword) {
          setErrorMessage('❌ L\'ancien mot de passe est requis pour changer le mot de passe');
          setSaving(false);
          return;
        }
        
        if (!formData.newPassword) {
          setErrorMessage('❌ Le nouveau mot de passe est requis');
          setSaving(false);
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setErrorMessage('❌ Le nouveau mot de passe doit contenir au moins 6 caractères');
          setSaving(false);
          return;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          setErrorMessage('❌ Les mots de passe ne correspondent pas');
          setSaving(false);
          return;
        }
        
        const passwordResponse = await changePassword(
          userData.id,
          formData.oldPassword,
          formData.newPassword
        );
        
        if (!passwordResponse.success) {
          setErrorMessage('❌ ' + passwordResponse.message);
          setSaving(false);
          return;
        }
      }
      
      const response = await updateUser(userData.id, {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email
      });
      
      if (response.success && response.data) {
        setUserData(response.data);
        const messages = ['✅ Informations modifiées avec succès !'];
        if (wantsToChangePassword) {
          messages.push('Mot de passe modifié avec succès !');
        }
        setSuccessMessage(messages.join(' '));
        
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
  const [lastClockIn, setLastClockIn] = useState<any | null>(null);

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
   * Charge les pointages de la semaine et les transforme en TimeLog
   */
  const loadWeekPointages = async () => {
    try {
      const { getWeekPointages } = await import('../services/pointageService');
      const weekPointages = await getWeekPointages();

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

      // Grouper les pointages par date
      const pointagesByDate: Record<string, typeof weekPointages> = {};
      weekPointages.forEach(p => {
        if (!pointagesByDate[p.date]) {
          pointagesByDate[p.date] = [];
        }
        pointagesByDate[p.date].push(p);
      });

      console.log('📊 Pointages groupés par date:', pointagesByDate);

      // Transformer chaque jour
      Object.entries(pointagesByDate).forEach(([date, pointages]) => {
        const dayKey = dateToDayKey(date);
        const dayLogs: TimeLog[] = [];

        // Trier par heure
        const sortedPointages = [...pointages].sort((a, b) =>
          a.heure.localeCompare(b.heure)
        );

        console.log(`🔍 Traitement du ${date} (${dayKey}):`, sortedPointages);

        // Créer des paires entrée/sortie
        for (let i = 0; i < sortedPointages.length; i++) {
          const pointage = sortedPointages[i];

          if (pointage.clockin === true) {
            // C'est une entrée, chercher la sortie correspondante
            const nextPointage = sortedPointages[i + 1];
            const start = pointage.heure.substring(0, 5); // "14:30:00" -> "14:30"

            console.log(`  ➡️ Entrée trouvée à ${start}`);

            if (nextPointage && nextPointage.clockin === false) {
              // Paire complète
              const end = nextPointage.heure.substring(0, 5);
              dayLogs.push({ start, end });
              console.log(`  ✅ Paire complète: ${start} - ${end}`);
              i++; // Sauter le prochain pointage car déjà traité
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
      console.log('✅ Pointages de la semaine chargés:', newTimeLogs);
    } catch (error) {
      console.error('❌ Erreur chargement pointages semaine:', error);
    }
  };

  /**
   * Vérifie les pointages du jour au chargement pour restaurer l'état
   */
  const checkTodayPointages = async () => {
    try {
      // Charger tous les pointages de la semaine
      await loadWeekPointages();

      // Vérifier le statut du jour actuel
      const { getTodayPointages } = await import('../services/pointageService');
      const todayPointages = await getTodayPointages();

      // Trouver le DERNIER pointage pour déterminer l'état actuel
      if (todayPointages.length > 0) {
        // Trier par heure pour avoir le dernier pointage
        const sortedPointages = [...todayPointages].sort((a, b) =>
          a.heure.localeCompare(b.heure)
        );
        const lastPointage = sortedPointages[sortedPointages.length - 1];

        // Si le dernier pointage est une entrée (clockin === true), on est en train de pointer
        if (lastPointage.clockin === true) {
          setLastClockIn(lastPointage);
          setIsClockingIn(true);
          const time = lastPointage.heure.substring(0, 5); // "14:30"
          setCurrentDayLogs({ start: time });
        } else {
          // Le dernier pointage est une sortie, on n'est pas en train de pointer
          setLastClockIn(null);
          setIsClockingIn(false);
          setCurrentDayLogs({ start: '' });
        }
      } else {
        // Aucun pointage aujourd'hui
        setLastClockIn(null);
        setIsClockingIn(false);
        setCurrentDayLogs({ start: '' });
      }
    } catch (error) {
      console.error('❌ Erreur vérification pointages:', error);
    }
  };

  /**
   * Gère à la fois Clock In et Clock Out avec la même fonction
   * L'API backend détermine automatiquement s'il faut faire un clock in ou un clock out
   */
  const handleClockIn = async () => {
    try {
      setPointageLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const { clockIn } = await import('../services/pointageService');
      const response = await clockIn();  // Appelle toujours la même route

      if (response.success && response.data) {
        const time = response.data.heure.substring(0, 5);

        // Si clockin === true → C'est une entrée
        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');
        }
        // Si clockin === false → C'est une sortie
        else {
          // Recharger tous les pointages de la semaine pour être sûr d'avoir les données à jour
          await loadWeekPointages();

          // Petit délai pour que le loader reste visible
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

  // handleClockOut n'est plus utilisé car tout passe par handleClockIn
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
