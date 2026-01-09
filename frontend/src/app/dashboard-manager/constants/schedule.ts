/**
 * Constantes partagées pour la gestion des horaires
 */

/**
 * Configuration des jours de la semaine
 */
export const DAYS = [
  { number: 1, name: 'Lundi', initial: 'L' },
  { number: 2, name: 'Mardi', initial: 'M' },
  { number: 3, name: 'Mercredi', initial: 'M' },
  { number: 4, name: 'Jeudi', initial: 'J' },
  { number: 5, name: 'Vendredi', initial: 'V' },
  { number: 6, name: 'Samedi', initial: 'S' },
  { number: 7, name: 'Dimanche', initial: 'D' }
] as const;

/**
 * Numéros de tous les jours de la semaine (1-7)
 */
export const ALL_DAY_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Configuration de l'horloge SVG pour le visualiseur
 */
export const CLOCK_CONFIG = {
  radius: 70,
  centerX: 90,
  centerY: 90,
  strokeWidth: 14,
  pointRadius: 6,
  centerCircleRadius: 22,
  glowRadius: 28
} as const;

/**
 * Seuils de durée pour les couleurs de l'horloge (en heures)
 */
export const DURATION_COLOR_THRESHOLDS = {
  long: 8,    // >= 8h → noir
  medium: 6,  // >= 6h → bleu
  // < 6h → violet
} as const;

/**
 * Couleurs associées aux durées
 */
export const DURATION_COLORS = {
  long: '#1a1a1a',    // Noir pour >= 8h
  medium: 'oklch(39.8% 0.07 227.392)',  // Bleu pour 6-8h
  short: 'oklch(45% 0.085 224.283)'    // Violet pour < 6h
} as const;

/**
 * Fonctions utilitaires pour les jours
 */

/**
 * Récupère le nom complet d'un jour à partir de son numéro (1-7)
 */
export function getDayName(dayNumber: number): string {
  const day = DAYS.find(d => d.number === dayNumber);
  return day?.name || '';
}

/**
 * Récupère l'initiale d'un jour à partir de son numéro (1-7)
 */
export function getDayInitial(dayNumber: number): string {
  const day = DAYS.find(d => d.number === dayNumber);
  return day?.initial || '';
}
