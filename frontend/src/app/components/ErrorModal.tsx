"use client";

import { AlertTriangle, X } from "lucide-react";
import { ApiError } from "../utils/errorHandler";

interface ErrorModalProps {
  isOpen: boolean;
  error: ApiError | null;
  onClose: () => void;
  onRetry?: () => void;
}

export default function ErrorModal({
  isOpen,
  error,
  onClose,
  onRetry,
}: ErrorModalProps) {
  if (!isOpen || !error) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-orange-600" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Fermer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">
          {error.title}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">{error.message}</p>

        {error.statusCode > 0 && (
          <p className="text-xs text-gray-400 mb-6">
            Code d'erreur : {error.statusCode}
          </p>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-3">
          {onRetry && error.canRetry && (
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Réessayer
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-black text-white rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-200"
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
}
