"use client";

import { useEffect } from 'react';
import { useTokenExpiration } from '../hooks/useTokenExpiration';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { setGlobalErrorHandler } from '../utils/apiClient';
import SessionExpiredModal from './SessionExpiredModal';
import ErrorModal from './ErrorModal';

/**
 * Composant Provider qui gère l'authentification globale
 * Surveille l'expiration du token et affiche les modals d'erreur
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showExpiredModal } = useTokenExpiration();
  const {
    currentError,
    isErrorModalOpen,
    showError,
    closeError,
    retryAction
  } = useErrorHandler();

  // Définir le handler global pour les erreurs API
  useEffect(() => {
    setGlobalErrorHandler(showError);
  }, [showError]);

  return (
    <>
      {children}
      <SessionExpiredModal isOpen={showExpiredModal} />
      <ErrorModal
        isOpen={isErrorModalOpen}
        error={currentError}
        onClose={closeError}
        onRetry={retryAction}
      />
    </>
  );
}
