import { X, Loader2 } from "lucide-react";
import { Manager, ManagerFormData } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: Manager;
  formData: ManagerFormData;
  setFormData: (data: ManagerFormData) => void;
  onSave: () => void;
  saving: boolean;
  successMessage: string;
  errorMessage: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  userData,
  formData,
  setFormData,
  onSave,
  saving,
  successMessage,
  errorMessage,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Paramètres du Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Prénom</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) =>
                setFormData({ ...formData, prenom: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) =>
                setFormData({ ...formData, telephone: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3">
              Changer le mot de passe
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Laissez vide si vous ne souhaitez pas changer le mot de passe
            </p>

            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">
                Ancien mot de passe *
              </label>
              <input
                type="password"
                value={formData.oldPassword}
                onChange={(e) =>
                  setFormData({ ...formData, oldPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                placeholder="Requis pour changer le mot de passe"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">
                Nouveau mot de passe * (min. 6 caractères)
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm"
                placeholder="Retapez le nouveau mot de passe"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            className="w-full mt-6 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
