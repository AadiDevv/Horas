import { toast } from 'sonner';

/**
 * Types d'erreurs selon leur nature
 */
export enum ErrorType {
  AUTH = 'auth',           // 401 - Token expiré (déconnexion)
  BUSINESS = 'business',   // 400, 403, 404, 409, 422 - Erreurs de logique métier
  SERVER = 'server',       // 500, 502, 503 - Erreurs serveur
  NETWORK = 'network',     // Fetch failed, timeout
  UNKNOWN = 'unknown'      // Autres
}

/**
 * Stratégie d'affichage pour chaque type d'erreur
 */
export enum DisplayStrategy {
  MODAL = 'modal',           // Modal bloquante (erreurs métier)
  TOAST = 'toast',           // Toast notification (erreurs serveur)
  SESSION_MODAL = 'session', // Modal session expirée (auth)
  SILENT = 'silent'          // Pas d'affichage (log uniquement)
}

/**
 * Interface pour les erreurs API standardisées venant du backend
 */
interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

/**
 * Structure d'une erreur API enrichie
 */
export interface ApiError {
  type: ErrorType;
  displayStrategy: DisplayStrategy;
  statusCode: number;
  title: string;
  message: string;
  technicalMessage?: string;
  canRetry: boolean;
  timestamp: string;
}

/**
 * Classifier une erreur HTTP selon son code de statut
 */
export function classifyError(statusCode: number): ErrorType {
  // 401 = Token expiré → Déconnexion automatique
  if (statusCode === 401) {
    return ErrorType.AUTH;
  }

  // 403 = Permission refusée → Modal d'erreur (PAS de déconnexion)
  // L'utilisateur est authentifié mais n'a pas les droits
  if (statusCode === 403) {
    return ErrorType.BUSINESS;
  }

  // Autres erreurs client (400, 404, 409, 422)
  if (statusCode >= 400 && statusCode < 500) {
    return ErrorType.BUSINESS;
  }

  // Erreurs serveur (500, 502, 503)
  if (statusCode >= 500 && statusCode < 600) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Déterminer la stratégie d'affichage selon le type d'erreur
 */
export function getDisplayStrategy(errorType: ErrorType): DisplayStrategy {
  switch (errorType) {
    case ErrorType.AUTH:
      return DisplayStrategy.SESSION_MODAL;
    case ErrorType.BUSINESS:
      return DisplayStrategy.MODAL;
    case ErrorType.SERVER:
    case ErrorType.NETWORK:
      return DisplayStrategy.TOAST;
    default:
      return DisplayStrategy.TOAST;
  }
}

/**
 * Générer un titre d'erreur user-friendly selon le code HTTP
 */
export function getErrorTitle(statusCode: number): string {
  // Erreurs d'authentification
  if (statusCode === 401) return 'Session expirée';
  if (statusCode === 403) return 'Accès refusé';

  // Erreurs métier
  if (statusCode === 400) return 'Données invalides';
  if (statusCode === 404) return 'Ressource introuvable';
  if (statusCode === 409) return 'Conflit détecté';
  if (statusCode === 422) return 'Action impossible';

  // Erreurs serveur
  if (statusCode === 500) return 'Erreur serveur';
  if (statusCode === 502) return 'Service temporairement indisponible';
  if (statusCode === 503) return 'Service en maintenance';

  // Par défaut
  return 'Une erreur est survenue';
}

/**
 * Générer un message d'erreur user-friendly
 */
export function getErrorMessage(statusCode: number, backendMessage?: string): string {
  // Si le backend fournit un message, l'utiliser en priorité
  if (backendMessage) {
    return backendMessage;
  }

  // Messages par défaut selon le code HTTP
  switch (statusCode) {
    case 400:
      return 'Les données fournies sont invalides. Veuillez vérifier votre saisie.';
    case 401:
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    case 403:
      return "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
    case 404:
      return "La ressource demandée n'existe pas ou a été supprimée.";
    case 409:
      return 'Cette action entre en conflit avec des données existantes.';
    case 422:
      return 'Cette action ne peut pas être effectuée en raison de règles métier.';
    case 500:
      return 'Une erreur technique est survenue. Veuillez réessayer plus tard.';
    case 502:
    case 503:
      return 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.';
    default:
      return 'Une erreur inattendue est survenue. Veuillez réessayer.';
  }
}

/**
 * Déterminer si l'erreur peut être retentée
 */
export function canRetry(statusCode: number): boolean {
  // Les erreurs serveur et réseau peuvent être retentées
  if (statusCode >= 500 && statusCode < 600) return true;
  if (statusCode === 408) return true; // Request Timeout
  if (statusCode === 429) return true; // Too Many Requests

  // Les erreurs métier ne doivent pas être retentées automatiquement
  return false;
}

/**
 * Parser une réponse d'erreur API
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const statusCode = response.status;
  const errorType = classifyError(statusCode);
  const displayStrategy = getDisplayStrategy(errorType);

  let backendMessage: string | undefined;
  let technicalMessage: string | undefined;

  try {
    const errorData = await response.json();
    backendMessage = errorData.message || errorData.error;
    technicalMessage = JSON.stringify(errorData);
  } catch {
    // Si le parsing JSON échoue, utiliser statusText
    technicalMessage = response.statusText;
  }

  return {
    type: errorType,
    displayStrategy,
    statusCode,
    title: getErrorTitle(statusCode),
    message: getErrorMessage(statusCode, backendMessage),
    technicalMessage,
    canRetry: canRetry(statusCode),
    timestamp: new Date().toISOString()
  };
}

/**
 * Gérer une erreur réseau (fetch failed)
 */
export function handleNetworkError(error: Error): ApiError {
  return {
    type: ErrorType.NETWORK,
    displayStrategy: DisplayStrategy.TOAST,
    statusCode: 0,
    title: 'Problème de connexion',
    message: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
    technicalMessage: error.message,
    canRetry: true,
    timestamp: new Date().toISOString()
  };
}

/**
 * Afficher une erreur selon sa stratégie
 * Note: Pour les modals, retourne l'erreur pour que le composant parent la gère
 */
export function displayError(error: ApiError): ApiError | null {
  switch (error.displayStrategy) {
    case DisplayStrategy.TOAST:
      // Afficher un toast pour les erreurs serveur
      toast.error(error.title, {
        description: error.message,
        duration: 5000
      });

   

      return null; // Pas besoin de retourner, déjà affiché

    case DisplayStrategy.MODAL:
    case DisplayStrategy.SESSION_MODAL:
      // Retourner l'erreur pour que le composant parent affiche le modal
      console.warn('⚠️ Erreur métier:', {
        status: error.statusCode,
        title: error.title,
        message: error.message
      });
      return error;

    case DisplayStrategy.SILENT:
      // Juste logger en console
      console.log('ℹ️ Erreur silencieuse:', error.message);
      return null;

    default:
      return error;
  }
}

/**
 * Extrait le message d'erreur d'une erreur API (legacy - maintenu pour compatibilité)
 * Gère plusieurs formats d'erreur possibles
 */
export function extractErrorMessage(error: unknown): string {
  // Erreur est une Error standard avec message
  if (error instanceof Error) {
    return error.message;
  }

  // Erreur est un objet avec une propriété error
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (typeof err.error === 'string') {
      return err.error;
    }

    if (typeof err.message === 'string') {
      return err.message;
    }
  }

  // Erreur est une string
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'Une erreur inattendue est survenue';
}

/**
 * Gère une erreur API en affichant un toast d'erreur (legacy - maintenu pour compatibilité)
 * Retourne le message d'erreur pour un traitement ultérieur si nécessaire
 */
export function handleApiError(error: unknown, context?: string): string {
  const errorMessage = extractErrorMessage(error);
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

  console.error('❌ Erreur API:', fullMessage, error);
  toast.error(fullMessage);

  return errorMessage;
}

/**
 * Affiche un toast de succès
 */
export function showSuccess(message: string, description?: string): void {
  console.log('✅ Succès:', message);
  toast.success(message, {
    description,
    duration: 3000
  });
}

/**
 * Affiche un toast d'information
 */
export function showInfo(message: string, description?: string): void {
  console.log('ℹ️ Info:', message);
  toast.info(message, {
    description,
    duration: 4000
  });
}

/**
 * Affiche un toast de warning
 */
export function showWarning(message: string, description?: string): void {
  console.log('⚠️ Warning:', message);
  toast.warning(message, {
    description,
    duration: 4000
  });
}
