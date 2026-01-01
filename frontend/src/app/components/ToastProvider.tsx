"use client";

import { Toaster } from 'sonner';

/**
 * ToastProvider - Wrapper pour le système de notifications toast
 * Utilise Sonner pour afficher les notifications de succès, d'erreur, etc.
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
    />
  );
}
