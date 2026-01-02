/**
 * Utilitaires pour gérer les dates sans problèmes de timezone
 */

/**
 * Formate une date en string ISO local (YYYY-MM-DD) sans conversion UTC
 * Évite les décalages de timezone causés par toISOString()
 *
 * @param date - Date à formater (par défaut: aujourd'hui)
 * @returns Date au format YYYY-MM-DD en heure locale
 *
 * @example
 * formatDateLocal(new Date(2026, 0, 15)) // "2026-01-15"
 * // Au lieu de: new Date(2026, 0, 15).toISOString().split('T')[0]
 * // qui peut retourner "2026-01-14" selon le fuseau horaire
 */
export function formatDateLocal(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formate une date et heure en ISO string UTC mais en préservant les valeurs locales
 * Utile quand on veut que l'heure affichée corresponde à l'heure stockée
 *
 * @param date - Date au format YYYY-MM-DD
 * @param time - Heure au format HH:MM
 * @returns ISO string au format YYYY-MM-DDTHH:mm:ss.000Z
 *
 * @example
 * formatDateTimeUTC("2026-01-15", "08:30") // "2026-01-15T08:30:00.000Z"
 * // L'heure 08:30 sera stockée comme 08:30 UTC, pas convertie
 */
export function formatDateTimeUTC(date: string, time: string): string {
  return `${date}T${time}:00.000Z`;
}

/**
 * Extrait la date locale (YYYY-MM-DD) depuis un ISO string
 * Sans conversion de timezone
 *
 * @param isoString - ISO string au format YYYY-MM-DDTHH:mm:ss.000Z
 * @returns Date au format YYYY-MM-DD
 *
 * @example
 * extractDateLocal("2026-01-15T08:30:00.000Z") // "2026-01-15"
 */
export function extractDateLocal(isoString: string): string {
  return isoString.substring(0, 10);
}

/**
 * Extrait l'heure locale (HH:MM) depuis un ISO string
 * Sans conversion de timezone
 *
 * @param isoString - ISO string au format YYYY-MM-DDTHH:mm:ss.000Z
 * @returns Heure au format HH:MM
 *
 * @example
 * extractTimeLocal("2026-01-15T08:30:00.000Z") // "08:30"
 */
export function extractTimeLocal(isoString: string): string {
  return isoString.substring(11, 16);
}

/**
 * Obtient le premier jour de la semaine (lundi) pour une date donnée
 *
 * @param date - Date de référence (par défaut: aujourd'hui)
 * @returns Date du lundi de la semaine
 */
export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Si dimanche (0), reculer de 6 jours
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Obtient le dernier jour de la semaine (dimanche) pour une date donnée
 *
 * @param date - Date de référence (par défaut: aujourd'hui)
 * @returns Date du dimanche de la semaine
 */
export function getSunday(date: Date = new Date()): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

/**
 * Génère un tableau de 7 dates (lundi à dimanche) pour une semaine donnée
 *
 * @param referenceDate - Date de référence (par défaut: aujourd'hui)
 * @returns Tableau de 7 dates de la semaine
 */
export function getWeekDays(referenceDate: Date = new Date()): Date[] {
  const monday = getMonday(referenceDate);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    day.setHours(0, 0, 0, 0);
    return day;
  });
}
