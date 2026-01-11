"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isTokenExpired, getStoredToken, logout } from '../utils/tokenManager';

export function useTokenExpiration() {
  const router = useRouter();
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  useEffect(() => {

    const checkTokenExpiration = () => {
      const token = getStoredToken();

      if (!token) {
        return;
      }

      if (isTokenExpired(token)) {

        logout();

        setShowExpiredModal(true);

        setTimeout(() => {
          setShowExpiredModal(false);
          router.push('/login');
        }, 2000);
      }
    };

    checkTokenExpiration();

    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);

  return {
    showExpiredModal,
    setShowExpiredModal
  };
}
