import { toast } from 'sonner';

export enum ErrorType {
  AUTH = 'auth',
  BUSINESS = 'business',
  SERVER = 'server',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

export enum DisplayStrategy {
  MODAL = 'modal',
  TOAST = 'toast',
  SESSION_MODAL = 'session',
  SILENT = 'silent'
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

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

export function classifyError(statusCode: number): ErrorType {

  if (statusCode === 401) {
    return ErrorType.AUTH;
  }

  if (statusCode === 403) {
    return ErrorType.BUSINESS;
  }

  if (statusCode >= 400 && statusCode < 500) {
    return ErrorType.BUSINESS;
  }

  if (statusCode >= 500 && statusCode < 600) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

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

export function getErrorTitle(statusCode: number): string {

  if (statusCode === 401) return 'Session expirée';
  if (statusCode === 403) return 'Accès refusé';

  if (statusCode === 400) return 'Données invalides';
  if (statusCode === 404) return 'Ressource introuvable';
  if (statusCode === 409) return 'Conflit détecté';
  if (statusCode === 422) return 'Action impossible';

  if (statusCode === 500) return 'Erreur serveur';
  if (statusCode === 502) return 'Service temporairement indisponible';
  if (statusCode === 503) return 'Service en maintenance';

  return 'Une erreur est survenue';
}

export function getErrorMessage(statusCode: number, backendMessage?: string): string {

  if (backendMessage) {
    return backendMessage;
  }

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

export function canRetry(statusCode: number): boolean {

  if (statusCode >= 500 && statusCode < 600) return true;
  if (statusCode === 408) return true;
  if (statusCode === 429) return true;

  return false;
}

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

export function displayError(error: ApiError): ApiError | null {
  switch (error.displayStrategy) {
    case DisplayStrategy.TOAST:

      toast.error(error.title, {
        description: error.message,
        duration: 5000
      });

      return null;

    case DisplayStrategy.MODAL:
    case DisplayStrategy.SESSION_MODAL:

      console.warn('⚠️ Erreur métier:', {
        status: error.statusCode,
        title: error.title,
        message: error.message
      });
      return error;

    case DisplayStrategy.SILENT:

      console.log('ℹ️ Erreur silencieuse:', error.message);
      return null;

    default:
      return error;
  }
}

export function extractErrorMessage(error: unknown): string {

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (typeof err.error === 'string') {
      return err.error;
    }

    if (typeof err.message === 'string') {
      return err.message;
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inattendue est survenue';
}

export function handleApiError(error: unknown, context?: string): string {
  const errorMessage = extractErrorMessage(error);
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;

  console.error('❌ Erreur API:', fullMessage, error);
  toast.error(fullMessage);

  return errorMessage;
}

export function showSuccess(message: string, description?: string): void {
  console.log('✅ Succès:', message);
  toast.success(message, {
    description,
    duration: 3000
  });
}

export function showInfo(message: string, description?: string): void {
  console.log('ℹ️ Info:', message);
  toast.info(message, {
    description,
    duration: 4000
  });
}

export function showWarning(message: string, description?: string): void {
  console.log('⚠️ Warning:', message);
  toast.warning(message, {
    description,
    duration: 4000
  });
}
