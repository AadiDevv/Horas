/**
 * Token Manager - Gestion centralisée des tokens JWT
 * Décode, vérifie et gère l'expiration des tokens sans librairie externe
 */

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

/**
 * Décode un token JWT sans librairie externe
 * Utilise atob() natif du navigateur
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token JWT invalide: format incorrect');
      return null;
    }

    // Décoder la partie payload (index 1)
    const payload = parts[1];
    // Remplacer les caractères URL-safe par les caractères base64 standard
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Décoder base64
    const decoded = atob(base64);
    // Parser JSON
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
}

/**
 * Vérifie si un token est expiré
 * Retourne true si expiré ou invalide
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp est en secondes, Date.now() est en millisecondes
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Calcule le temps restant avant expiration en secondes
 * Retourne 0 si déjà expiré ou invalide
 */
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

/**
 * Récupère le token depuis localStorage
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Déconnexion centralisée
 * Nettoie le localStorage et redirige vers la page de login
 */
export function logout(): void {
  if (typeof window === 'undefined') return;

  // Nettoyer toutes les données d'authentification
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');

  console.log('🔒 Déconnexion effectuée - localStorage nettoyé');
}

/**
 * Vérifie si l'utilisateur est authentifié avec un token valide
 */
export function isAuthenticated(): boolean {
  const token = getStoredToken();
  return !isTokenExpired(token);
}

/**
 * Récupère les informations utilisateur depuis le token
 */
export function getUserFromToken(): JWTPayload | null {
  const token = getStoredToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return decodeToken(token);
}
