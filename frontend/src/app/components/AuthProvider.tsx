"use client";

import { useEffect } from 'react';
import { useTokenExpiration } from '../hooks/useTokenExpiration';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { setGlobalErrorHandler } from '../utils/apiClient';
import SessionExpiredModal from './SessionExpiredModal';
import ErrorModal from './ErrorModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showExpiredModal } = useTokenExpiration();
  const {
    currentError,
    isErrorModalOpen,
    showError,
    closeError,
    retryAction
  } = useErrorHandler();

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
