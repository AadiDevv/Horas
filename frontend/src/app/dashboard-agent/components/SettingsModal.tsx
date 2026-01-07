import { X, Loader2, Info } from "lucide-react";
import { User, UserFormData } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
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

  const isEmployee = userData.role === "employe";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Paramètres</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold">Prénom</label>
              {isEmployee && (
                <div className="group relative">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Contactez votre manager pour modifier cette information
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) =>
                setFormData({ ...formData, prenom: e.target.value })
              }
              disabled={isEmployee}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
                isEmployee ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold">Nom</label>
              {isEmployee && (
                <div className="group relative">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Contactez votre manager pour modifier cette information
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) =>
                setFormData({ ...formData, nom: e.target.value })
              }
              disabled={isEmployee}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
                isEmployee ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold">Email</label>
              {isEmployee && (
                <div className="group relative">
                  <Info size={16} className="text-gray-400 cursor-help" />
                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    Contactez votre manager pour modifier cette information
                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isEmployee}
              className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black ${
                isEmployee ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
              }`}
            />
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
