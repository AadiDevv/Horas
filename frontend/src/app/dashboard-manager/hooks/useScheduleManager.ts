import { useState } from 'react';
import { toast } from 'sonner';
import { Schedule, ScheduleFormData } from '../types';
import * as api from '../services/apiService';

export function useScheduleManager() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    startHour: '09:00',
    endHour: '17:00',
    activeDays: []
  });

  // ==================== LOAD SCHEDULES ====================
  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      const result = await api.getSchedules();
      if (result.success && result.data) {
        setSchedules(result.data);
      } else {
        toast.error('Impossible de charger les horaires');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error);
      toast.error('Une erreur est survenue lors du chargement des horaires');
    }
    setLoadingSchedules(false);
  };

  // ==================== CREATE SCHEDULE ====================
  const handleCreate = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    if (formData.activeDays.length === 0) {
      toast.error('Au moins un jour doit être sélectionné');
      return;
    }
    if (formData.startHour >= formData.endHour) {
      toast.error('L\'heure de début doit être inférieure à l\'heure de fin');
      return;
    }

    setLoadingSchedules(true);
    try {
      const result = await api.createSchedule({
        name: formData.name,
        startHour: formData.startHour,
        endHour: formData.endHour,
        activeDays: formData.activeDays
      });

      if (result.success) {
        toast.success(`Horaire "${formData.name}" créé avec succès`);
        await loadSchedules();
        setShowModal(false);
        resetForm();
      } else {
        toast.error(result.error || 'Impossible de créer l\'horaire');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la création: ${message}`);
    }
    setLoadingSchedules(false);
  };

  // ==================== UPDATE SCHEDULE ====================
  const handleUpdate = async () => {
    if (!editingSchedule) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    if (formData.activeDays.length === 0) {
      toast.error('Au moins un jour doit être sélectionné');
      return;
    }
    if (formData.startHour >= formData.endHour) {
      toast.error('L\'heure de début doit être inférieure à l\'heure de fin');
      return;
    }

    setLoadingSchedules(true);
    try {
      const result = await api.updateSchedule(editingSchedule.id, {
        name: formData.name,
        startHour: formData.startHour,
        endHour: formData.endHour,
        activeDays: formData.activeDays
      });

      if (result.success) {
        toast.success(`Horaire "${formData.name}" modifié avec succès`);
        await loadSchedules();
        setShowModal(false);
        resetForm();
      } else {
        toast.error(result.error || 'Impossible de modifier l\'horaire');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la modification: ${message}`);
    }
    setLoadingSchedules(false);
  };

  // ==================== DELETE SCHEDULE ====================
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet horaire ? Cette action est irréversible.')) {
      return;
    }

    setLoadingSchedules(true);
    try {
      const result = await api.deleteSchedule(id);
      if (result.success) {
        toast.success('Horaire supprimé avec succès');
        await loadSchedules();
      } else {
        toast.error(result.error || 'Impossible de supprimer l\'horaire');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la suppression: ${message}`);
    }
    setLoadingSchedules(false);
  };

  // ==================== MODAL MANAGEMENT ====================
  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      startHour: schedule.startHour,
      endHour: schedule.endHour,
      activeDays: schedule.activeDays
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startHour: '09:00',
      endHour: '17:00',
      activeDays: []
    });
    setEditingSchedule(null);
  };

  return {
    schedules,
    loadingSchedules,
    showModal,
    setShowModal,
    editingSchedule,
    formData,
    setFormData,
    loadSchedules,
    handleCreate,
    handleUpdate,
    handleDelete,
    openEditModal,
    resetForm
  };
}
