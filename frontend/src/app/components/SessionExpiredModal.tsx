"use client";

import { LogOut } from "lucide-react";

interface SessionExpiredModalProps {
  isOpen: boolean;
}

/**
 * Modal qui s'affiche lorsque la session utilisateur a expiré
 * Informe l'utilisateur et le redirige automatiquement vers la page de login
 */
export default function SessionExpiredModal({ isOpen }: SessionExpiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Icône */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut size={32} className="text-red-600" />
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-semibold mb-3">Session expirée</h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            Votre session a expiré pour des raisons de sécurité. Vous allez être redirigé vers la page de connexion.
          </p>

          {/* Loader de redirection */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            Redirection en cours...
          </div>
        </div>
      </div>
    </div>
  );
}
