"use client";

import { useState, useCallback } from 'react';
import { ApiError } from '../utils/errorHandler';

export function useErrorHandler() {
  const [currentError, setCurrentError] = useState<ApiError | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const showError = useCallback((error: ApiError) => {
    setCurrentError(error);
    setIsErrorModalOpen(true);
  }, []);

  const closeError = useCallback(() => {
    setIsErrorModalOpen(false);

    setTimeout(() => {
      setCurrentError(null);
    }, 300);
  }, []);

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
