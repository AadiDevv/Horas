/**
 * API Client - Wrapper autour de fetch avec vérification automatique du token
 * Vérifie l'expiration du token avant chaque requête
 */

import { isTokenExpired, getStoredToken, logout } from './tokenManager';

/**
 * Wrapper fetch qui vérifie le token avant chaque requête
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

  // Si le token est valide, effectuer la requête normalement
  return fetch(url, options);
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
