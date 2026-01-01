import { toast } from 'sonner';

/**
 * Interface pour les erreurs API standardisées venant du backend
 */
interface ApiError {
  success: false;
  error: string;
  code?: string;
  timestamp?: string;
}

/**
 * Extrait le message d'erreur d'une erreur API
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
 * Gère une erreur API en affichant un toast d'erreur
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
export function showSuccess(message: string): void {
  console.log('✅ Succès:', message);
  toast.success(message);
}

/**
 * Affiche un toast d'information
 */
export function showInfo(message: string): void {
  console.log('ℹ️ Info:', message);
  toast.info(message);
}

/**
 * Affiche un toast de warning
 */
export function showWarning(message: string): void {
  console.log('⚠️ Warning:', message);
  toast.warning(message);
}
