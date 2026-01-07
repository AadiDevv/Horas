import { useState } from 'react';
import { Manager, ManagerFormData } from '../types';

export function useManagerSettings() {
  const [userData, setUserData] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<ManagerFormData>({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const managerData: Manager = {
          id: user.id,
          prenom: user.firstName || user.prenom || '',
          nom: user.lastName || user.nom || '',
          email: user.email || '',
          role: user.role || '',
          telephone: user.telephone || ''
        };
        setUserData(managerData);
        setFormData({
          prenom: managerData.prenom,
          nom: managerData.nom,
          email: managerData.email,
          telephone: managerData.telephone || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (e) {
        console.error('Erreur lors du parsing des données utilisateur:', e);
      }
    }
  };

  const handleOpenSettings = () => {
    loadUserData();
    setSettingsOpen(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSaveSettings = async () => {
    if (!userData) return;

    if (!formData.prenom || !formData.nom || !formData.email) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const updatedUser = {
          ...user,
          firstName: formData.prenom,
          lastName: formData.nom,
          email: formData.email,
          telephone: formData.telephone
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
      }

      setUserData({
        ...userData,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone
      });

      setSuccessMessage('Paramètres enregistrés avec succès !');

      setTimeout(() => {
        setSettingsOpen(false);
        setSuccessMessage('');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrorMessage('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  return {
    userData,
    setUserData,
    formData,
    setFormData,
    settingsOpen,
    setSettingsOpen,
    saving,
    successMessage,
    errorMessage,
    loadUserData,
    handleOpenSettings,
    handleSaveSettings
  };
}
