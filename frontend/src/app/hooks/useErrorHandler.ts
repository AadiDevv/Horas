"use client";

import { useState, useCallback } from 'react';
import { ApiError } from '../utils/errorHandler';

/**
 * Hook pour gérer l'état global des erreurs
 * Permet d'afficher le ErrorModal de manière centralisée
 */
export function useErrorHandler() {
  const [currentError, setCurrentError] = useState<ApiError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  /**
   * Afficher une erreur dans le modal
   */
  const showError = useCallback((error: ApiError) => {
    setCurrentError(error);
    setIsErrorModalOpen(true);
  }, []);

  /**
   * Fermer le modal d'erreur
   */
  const closeError = useCallback(() => {
    setIsErrorModalOpen(false);
    // Nettoyer l'erreur après l'animation de fermeture
    setTimeout(() => {
      setCurrentError(null);
    }, 300);
  }, []);

  /**
   * Réessayer l'action qui a échoué (si fournie)
   */
  const [retryAction, setRetryAction] = useState<(() => void) | undefined>();

  const showErrorWithRetry = useCallback((error: ApiError, onRetry?: () => void) => {
    setCurrentError(error);
    setRetryAction(() => onRetry);
    setIsErrorModalOpen(true);
  }, []);

  return {
    currentError,
    isErrorModalOpen,
    showError,
    showErrorWithRetry,
    closeError,
    retryAction
  };
}
