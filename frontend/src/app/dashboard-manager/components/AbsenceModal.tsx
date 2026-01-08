import { useState, useEffect } from "react";
import { X, Save, Calendar as CalendarIcon, UserX, Trash2 } from "lucide-react";
import { Absence } from "../services/absenceService";

interface AbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AbsenceFormData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  absence?: Absence | null;
  employeeId: number;
  employeeName: string;
}

export interface AbsenceFormData {
  id?: number;
  employeId: number;
  type:
    | "conges_payes"
    | "conges_sans_solde"
    | "maladie"
    | "formation"
    | "teletravail"
    | "autre";
  startDateTime: string;
  endDateTime: string;
  comments?: string;
  status?: "en_attente" | "approuve" | "refuse";
}

const ABSENCE_TYPES = [
  { value: "conges_payes", label: "Congés payés" },
  { value: "conges_sans_solde", label: "Congés sans solde" },
  { value: "maladie", label: "Maladie" },
  { value: "formation", label: "Formation" },
  { value: "teletravail", label: "Télétravail" },
  { value: "autre", label: "Autre" },
];

export default function AbsenceModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  absence,
  employeeId,
  employeeName,
}: AbsenceModalProps) {
  const isEditing = !!absence;

  const [formData, setFormData] = useState<AbsenceFormData>({
    employeId: employeeId,
    type: "conges_payes",
    startDateTime: "",
    endDateTime: "",
    comments: "",
    status: "en_attente",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (absence) {
      const startDate = absence.startDateTime.substring(0, 10);
      const endDate = absence.endDateTime.substring(0, 10);

      setFormData({
        id: absence.id,
        employeId: absence.employeId,
        type: absence.type,
        startDateTime: startDate,
        endDateTime: endDate,
        comments: absence.comments || "",
        status: absence.status,
      });
    } else {
      const today = new Date().toISOString().substring(0, 10);
      setFormData({
        employeId: employeeId,
        type: "conges_payes",
        startDateTime: today,
        endDateTime: today,
        comments: "",
        status: "en_attente",
      });
    }
  }, [absence, employeeId]);

  const handleSubmit = async () => {
    setLocalError("");

    if (!formData.startDateTime || !formData.endDateTime) {
      setLocalError("Les dates de début et fin sont requises");
      return;
    }

    if (new Date(formData.startDateTime) > new Date(formData.endDateTime)) {
      setLocalError("La date de fin doit être après la date de début");
      return;
    }

    setSaving(true);
    try {
      const startISO = `${formData.startDateTime}T08:00:00.000Z`;
      const endISO = `${formData.endDateTime}T18:00:00.000Z`;

      await onSave({
        ...formData,
        startDateTime: startISO,
        endDateTime: endISO,
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setLocalError("Une erreur est survenue lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!absence?.id || !onDelete) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      return;
    }

    setDeleting(true);
    setLocalError("");
    try {
      await onDelete(absence.id);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setLocalError("Une erreur est survenue lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <UserX size={24} className="text-gray-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Modifier l'absence" : "Créer une absence"}
              </h2>
              <p className="text-sm text-gray-500">{employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer active:scale-95"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {localError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'absence
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
            >
              {ABSENCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={formData.startDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, startDateTime: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={formData.endDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, endDateTime: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires (optionnel)
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ajouter un commentaire..."
            />
          </div>

          {/* Statut (uniquement en mode édition) */}
          {isEditing && absence?.status === "en_attente" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setFormData({ ...formData, status: "approuve" })
                  }
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer active:scale-95 ${
                    formData.status === "approuve"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Approuver
                </button>
                <button
                  onClick={() => setFormData({ ...formData, status: "refuse" })}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer active:scale-95 ${
                    formData.status === "refuse"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Refuser
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <div>
            {isEditing && onDelete && absence?.id && (
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Supprimer
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors cursor-pointer active:scale-95"
              disabled={saving || deleting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || deleting}
              className="px-6 py-2 bg-black hover:bg-gray-900 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? "Enregistrer" : "Créer"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
