import { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar as CalendarIcon, ArrowRightLeft, MousePointer } from 'lucide-react';
import { Timesheet } from '../services/timesheetService';
import { formatDateLocal } from '@/app/utils/dateUtils';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlockData) => Promise<void>;
  entryTimesheet?: Timesheet | null;
  exitTimesheet?: Timesheet | null;
  employeeId: number;
  employeeName: string;
  initialDate?: string;
  initialStartTime?: string;
}

export interface BlockData {
  entryId?: number;
  exitId?: number;
  employeId: number;
  date: string;
  startTime: string; // Format HH:MM
  endTime?: string;  // Format HH:MM (optionnel si pointage unique)
  status: 'normal' | 'retard' | 'absence';
  mode: 'pair' | 'single'; // Mode de création
}

export default function BlockModal({
  isOpen,
  onClose,
  onSave,
  entryTimesheet,
  exitTimesheet,
  employeeId,
  employeeName,
  initialDate,
  initialStartTime
}: BlockModalProps) {
  const isEditing = !!(entryTimesheet && exitTimesheet);

  const [formData, setFormData] = useState<BlockData>({
    employeId: employeeId,
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    status: 'normal',
    mode: 'pair'
  });
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');

  // Initialiser le formulaire
  useEffect(() => {
    if (entryTimesheet && exitTimesheet) {
      // Mode édition
      // Extraire la date au format YYYY-MM-DD
      const date = entryTimesheet.timestamp.substring(0, 10); // "YYYY-MM-DD"
      
      // Extraire l'heure au format HH:MM depuis l'ISO string
      const startTime = entryTimesheet.timestamp.substring(11, 16); // "HH:MM"
      const endTime = exitTimesheet.timestamp.substring(11, 16); // "HH:MM"

      setFormData({
        entryId: entryTimesheet.id,
        exitId: exitTimesheet.id,
        employeId: entryTimesheet.employeId,
        date,
        startTime,
        endTime,
        status: entryTimesheet.status,
        mode: 'pair'
      });
    } else {
      // Mode création
      const date = initialDate || formatDateLocal();
      let startTime = '09:00';

      if (initialStartTime) {
        const d = new Date(initialStartTime);
        startTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      }

      // Calculer l'heure de fin (+1h)
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      setFormData({
        employeId: employeeId,
        date,
        startTime,
        endTime,
        status: 'normal',
        mode: 'pair'
      });
    }
    setLocalError('');
  }, [entryTimesheet, exitTimesheet, employeeId, initialDate, initialStartTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Validation: heure de fin après heure de début (uniquement en mode paire)
    if (formData.mode === 'pair' && formData.endTime) {
      const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      if (endTotalMinutes <= startTotalMinutes) {
        setLocalError('L\'heure de fin doit être après l\'heure de début');
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      // Les erreurs API (400, etc.) sont gérées par ErrorModal global
      // On ne gère ici que les erreurs inattendues
      console.log('Erreur gérée par ErrorModal global:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le bloc' : 'Créer un pointage'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{employeeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {localError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <CalendarIcon size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Mode de création (uniquement en création) */}
          {!isEditing && (
            <div className="flex items-center justify-start">

              {/* VERSION 1: Tabs discrets (ACTIVE) */}
              <div className="flex items-center border-b border-gray-200 w-full">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mode: 'pair' }))}
                  className={`flex-1 p-2 transition-colors relative flex items-center justify-center ${
                    formData.mode === 'pair'
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Période (entrée + sortie)"
                >
                  <ArrowRightLeft size={18} />
                  {formData.mode === 'pair' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mode: 'single' }))}
                  className={`flex-1 p-2 transition-colors relative flex items-center justify-center ${
                    formData.mode === 'single'
                      ? 'text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Pointage unique (auto-détection)"
                >
                  <MousePointer size={18} />
                  {formData.mode === 'single' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                  )}
                </button>
              </div>

              {/* VERSION 2: Toggle switch simple (COMMENTÉE)
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  mode: prev.mode === 'pair' ? 'single' : 'pair'
                }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  formData.mode === 'pair'
                    ? 'border-gray-300 bg-gray-50 text-gray-700'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}
                title={formData.mode === 'pair' ? 'Période (entrée + sortie)' : 'Pointage unique (auto-détection)'}
              >
                {formData.mode === 'pair' ? (
                  <>
                    <ArrowRightLeft size={16} />
                    <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                      <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-4 bg-gray-300 rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                    </div>
                    <MousePointer size={16} />
                  </>
                )}
              </button>
              */}
            </div>
          )}

          {/* Heures */}
          {formData.mode === 'pair' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Début
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Fin
                </label>
                <input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Heure du pointage
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
          )}

          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="normal">Normal</option>
              <option value="retard">Retard</option>
              <option value="absence">Absence</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
