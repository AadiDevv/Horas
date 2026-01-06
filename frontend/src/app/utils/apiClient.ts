

import { isTokenExpired, getStoredToken, logout } from './tokenManager';
import { parseApiError, handleNetworkError, displayError, type ApiError } from './errorHandler';

let globalErrorHandler: ((error: ApiError) => void) | null = null;

export function setGlobalErrorHandler(handler: (error: ApiError) => void) {
  globalErrorHandler = handler;
}

export async function secureFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {

  const token = getStoredToken();

  if (token && isTokenExpired(token)) {
    console.error('⚠️ Token expiré détecté avant requête API - Déconnexion');
    logout();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }

  try {

    const response = await fetch(url, options);

    if (response.ok) {
      return response;
    }

    const apiError = await parseApiError(response);

    const modalError = displayError(apiError);

    if (modalError && globalErrorHandler) {
      globalErrorHandler(modalError);
    }

    throw new Error(apiError.message);

  } catch (error) {

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = handleNetworkError(error);
      displayError(networkError);
      throw error;
    }

    throw error;
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

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
