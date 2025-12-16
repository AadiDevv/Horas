import { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Timesheet } from '../services/timesheetService';

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
  endTime: string;   // Format HH:MM
  status: 'normal' | 'retard' | 'absence';
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
    status: 'normal'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Initialiser le formulaire
  useEffect(() => {
    if (entryTimesheet && exitTimesheet) {
      // Mode édition
      // Extraire date et heures depuis les timestamps
      // Format ISO: "2025-12-13T14:26:00.000Z"
      const entryDate = new Date(entryTimesheet.timestamp);
      const exitDate = new Date(exitTimesheet.timestamp);

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
        status: entryTimesheet.status
      });
    } else {
      // Mode création
      const date = initialDate || new Date().toISOString().split('T')[0];
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
        status: 'normal'
      });
    }
    setError('');
  }, [entryTimesheet, exitTimesheet, employeeId, initialDate, initialStartTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation: heure de fin après heure de début
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    if (endTotalMinutes <= startTotalMinutes) {
      setError('L\'heure de fin doit être après l\'heure de début');
      return;
    }

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le bloc' : 'Créer un bloc'}
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

          {/* Heures */}
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
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>
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
