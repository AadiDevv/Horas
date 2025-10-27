import { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Timesheet } from '../services/timesheetService';

interface TimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TimesheetData) => Promise<void>;
  timesheet?: Timesheet | null; // Si null = création, sinon édition
  employeeId: number;
  employeeName: string;
  initialDate?: string; // Pour la création
  initialHour?: string; // Pour la création
}

export interface TimesheetData {
  id?: number;
  employeId: number;
  date: string;
  hour: string;
  clockin: boolean;
  status: 'normal' | 'retard' | 'absence';
}

export default function TimesheetModal({
  isOpen,
  onClose,
  onSave,
  timesheet,
  employeeId,
  employeeName,
  initialDate,
  initialHour
}: TimesheetModalProps) {
  const isEditing = !!timesheet;

  const [formData, setFormData] = useState<TimesheetData>({
    employeId: 0,
    date: '',
    hour: '',
    clockin: true,
    status: 'normal'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialiser le formulaire
  useEffect(() => {
    if (timesheet) {
      // Mode édition
      setFormData({
        id: timesheet.id,
        employeId: timesheet.employeId,
        date: timesheet.date,
        hour: timesheet.hour,
        clockin: timesheet.clockin,
        status: timesheet.status
      });
    } else {
      // Mode création
      const date = initialDate || new Date().toISOString().split('T')[0];
      const hour = initialHour || new Date().toISOString();

      setFormData({
        employeId: employeeId,
        date,
        hour,
        clockin: true,
        status: 'normal'
      });
    }
    setError('');
  }, [timesheet, employeeId, initialDate, initialHour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Convertir hour ISO en date et heure séparées pour les inputs
  const getDateFromHour = () => {
    if (!formData.hour) return '';
    return formData.hour.split('T')[0];
  };

  const getTimeFromHour = () => {
    if (!formData.hour) return '';
    const date = new Date(formData.hour);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const updateDateTime = (dateStr?: string, timeStr?: string) => {
    const currentDate = dateStr || getDateFromHour();
    const currentTime = timeStr || getTimeFromHour();

    const [hours, minutes] = currentTime.split(':');
    const isoDate = new Date(currentDate);
    isoDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    setFormData(prev => ({
      ...prev,
      date: currentDate,
      hour: isoDate.toISOString()
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le pointage' : 'Créer un pointage'}
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de pointage */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de pointage
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, clockin: true }))}
                className={`p-3 rounded-xl font-medium transition-all ${
                  formData.clockin
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Entrée
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, clockin: false }))}
                className={`p-3 rounded-xl font-medium transition-all ${
                  !formData.clockin
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sortie
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <CalendarIcon size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={getDateFromHour()}
              onChange={(e) => updateDateTime(e.target.value, undefined)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Heure */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Heure
            </label>
            <input
              type="time"
              value={getTimeFromHour()}
              onChange={(e) => updateDateTime(undefined, e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

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
