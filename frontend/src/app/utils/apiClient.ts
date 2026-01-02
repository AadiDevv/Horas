/**
 * API Client - Wrapper autour de fetch avec vérification automatique du token
 * Vérifie l'expiration du token avant chaque requête
 * Gère automatiquement les erreurs HTTP selon leur type
 */

import { isTokenExpired, getStoredToken, logout } from './tokenManager';
import { parseApiError, handleNetworkError, displayError, type ApiError } from './errorHandler';

/**
 * Callback global pour gérer les erreurs qui nécessitent un modal
 * Sera défini par le ErrorProvider
 */
let globalErrorHandler: ((error: ApiError) => void) | null = null;

export function setGlobalErrorHandler(handler: (error: ApiError) => void) {
  globalErrorHandler = handler;
}

/**
 * Wrapper fetch qui vérifie le token avant chaque requête et gère les erreurs
 * Si le token est expiré, déconnecte l'utilisateur automatiquement
 */
export async function secureFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  // Vérifier le token avant la requête
  const token = getStoredToken();

  if (token && isTokenExpired(token)) {
    console.error('⚠️ Token expiré détecté avant requête API - Déconnexion');
    logout();

    // Rediriger vers login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    // Lancer une erreur pour arrêter la requête
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  try {
    // Effectuer la requête
    const response = await fetch(url, options);

    // Si la réponse est OK (200-299), la retourner
    if (response.ok) {
      return response;
    }

    // Si erreur HTTP, parser et gérer selon le type
    const apiError = await parseApiError(response);

    // Afficher l'erreur selon sa stratégie (TOAST ou MODAL)
    const modalError = displayError(apiError);

    // Si c'est une erreur qui nécessite un modal, notifier le handler global
    if (modalError && globalErrorHandler) {
      globalErrorHandler(modalError);
    }

    // Lancer une erreur pour interrompre le flux
    throw new Error(apiError.message);

  } catch (error) {
    // Gérer les erreurs réseau (fetch failed, timeout, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = handleNetworkError(error);
      displayError(networkError);
      throw error;
    }

    // Re-lancer l'erreur pour que l'appelant puisse la gérer
    throw error;
  }
}

/**
 * Helper pour créer les headers d'authentification
 * Compatible avec l'existant (utilisé dans apiService.ts)
 */
export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Wrapper fetch avec headers automatiques et vérification token
 */
export const apiClient = {
  async get(url: string, options?: RequestInit): Promise<Response> {
    return secureFetch(url, {
      ...options,
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers
      }
    });
  },

  async post(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return secureFetch(url, {
      ...options,
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  },

  async patch(url: string, body?: any, options?: RequestInit): Promise<Response> {
    return secureFetch(url, {
      ...options,
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  },

  async delete(url: string, options?: RequestInit): Promise<Response> {
    return secureFetch(url, {
      ...options,
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...options?.headers
      }
    });
  }
};
