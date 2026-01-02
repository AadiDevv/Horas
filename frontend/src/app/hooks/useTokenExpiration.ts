"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, getStoredToken, logout } from '../utils/tokenManager';

/**
 * Hook qui surveille l'expiration du token JWT
 * Déconnecte automatiquement l'utilisateur si le token expire
 * Vérifie toutes les 60 secondes
 */
export function useTokenExpiration() {
  const router = useRouter();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {
    // Fonction de vérification du token
    const checkTokenExpiration = () => {
      const token = getStoredToken();

      // Si pas de token, rien à vérifier
      if (!token) {
        return;
      }

      // Vérifier si le token est expiré
      if (isTokenExpired(token)) {
        console.log('⚠️ Token expiré détecté - Déconnexion automatique');

        // Déconnexion
        logout();

        // Afficher le modal
        setShowExpiredModal(true);

        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          setShowExpiredModal(false);
          router.push('/login');
        }, 2000);
      }
    };

    // Vérification initiale au montage du composant
    checkTokenExpiration();

    // Vérification périodique toutes les 60 secondes
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // 60 secondes

    // Nettoyage de l'intervalle au démontage
    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  return {
    showExpiredModal,
    setShowExpiredModal
  };
}
