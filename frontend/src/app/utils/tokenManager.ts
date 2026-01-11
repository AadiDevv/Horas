

export interface JWTPayload {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  exp: number;
  iat: number;
  type: string;
  lastLoginAt?: string;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    const decoded = atob(base64);

    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

export function getTimeUntilExpiration(token: string | null): number {
  if (!token) return 0;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - now;
  return Math.max(0, timeLeft);
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function logout(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');

}

export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return !isTokenExpired(token);
}

export function getUserFromToken(): JWTPayload | null {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return decodeToken(token);
}
