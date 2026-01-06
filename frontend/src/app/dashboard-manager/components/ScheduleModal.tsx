import { X, Loader2 } from 'lucide-react';
import { Schedule, ScheduleFormData } from '../types';
import { DAYS } from '../constants/schedule';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  formData: ScheduleFormData;
  setFormData: (data: ScheduleFormData) => void;
  onSave: () => void;
  loading: boolean;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  schedule,
  formData,
  setFormData,
  onSave,
  loading
}: ScheduleModalProps) {
  if (!isOpen) return null;

  const toggleDay = (dayNumber: number) => {
    if (formData.activeDays.includes(dayNumber)) {
      setFormData({
        ...formData,
        activeDays: formData.activeDays.filter(d => d !== dayNumber)
      });
    } else {
      setFormData({
        ...formData,
        activeDays: [...formData.activeDays, dayNumber].sort((a, b) => a - b)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {schedule ? "Modifier l'horaire" : 'Nouvel horaire'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nom de l&apos;horaire <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ex: Horaire Standard"
            />
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Heure début <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startHour}
                onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Heure fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endHour}
                onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Active days */}
          <div>
            <label className="block text-sm font-semibold mb-3">
              Jours actifs <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DAYS.map((day) => (
                <label
                  key={day.number}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    formData.activeDays.includes(day.number)
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.activeDays.includes(day.number)}
                    onChange={() => toggleDay(day.number)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">{day.name}</span>
                </label>
              ))}
            </div>
            {formData.activeDays.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                Au moins un jour doit être sélectionné
              </p>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={loading || !formData.name.trim() || formData.activeDays.length === 0}
          className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {schedule ? 'Modification...' : 'Création...'}
            </>
          ) : (
            schedule ? 'Modifier' : 'Créer'
          )}
        </button>
      </div>
    </div>
  );
}
