import { useState } from 'react';
import { DayKey, TimeLog, User, UserFormData } from '../types';
import { getUser, updateUser, changePassword } from '../services/userService';

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
   * Vérifie les pointages du jour au chargement pour restaurer l'état
   */
  const checkTodayPointages = async () => {
    try {
      const { getTodayPointages } = await import('../services/pointageService');
      const todayPointages = await getTodayPointages();

      // Trouver le dernier pointage d'entrée sans sortie
      const activeClockIn = todayPointages.find(p => p.clockin === true);

      if (activeClockIn) {
        setLastClockIn(activeClockIn);
        setIsClockingIn(true);
        // Reconstruire les logs pour le jour actuel
        const time = activeClockIn.heure.substring(0, 5); // "14:30"
        setCurrentDayLogs({ start: time });
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
        const dayKey = getDayKey();

        // Si clockin === true → C'est une entrée
        if (response.data.clockin === true) {
          setLastClockIn(response.data);
          setIsClockingIn(true);
          setCurrentDayLogs({ start: time });
          setSuccessMessage('✅ Pointage d\'entrée enregistré avec succès !');
        }
        // Si clockin === false → C'est une sortie
        else {
          setTimeLogs(prev => ({
            ...prev,
            [dayKey]: [...prev[dayKey], { ...currentDayLogs, end: time }]
          }));

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
    checkTodayPointages
  };
}
