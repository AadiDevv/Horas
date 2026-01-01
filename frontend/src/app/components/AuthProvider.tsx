"use client";

import { useTokenExpiration } from '../hooks/useTokenExpiration';
import SessionExpiredModal from './SessionExpiredModal';

/**
 * Composant Provider qui gère l'authentification globale
 * Surveille l'expiration du token et affiche le modal si nécessaire
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { showExpiredModal } = useTokenExpiration();

  return (
    <>
      {children}
      <SessionExpiredModal isOpen={showExpiredModal} />
    </>
  );
}
