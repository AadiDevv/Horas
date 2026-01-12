export function formatDateLocal(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convertit une date et heure locale en timestamp ISO UTC
 * Ex: "2026-01-12" + "18:00" en France (UTC+1) → "2026-01-12T17:00:00.000Z"
 * Utilisé pour envoyer les timestamps au backend
 * @param date - Date au format "YYYY-MM-DD"
 * @param time - Heure locale au format "HH:mm"
 * @returns Timestamp ISO UTC
 */
export function formatDateTimeUTC(date: string, time: string): string {
  // Crée une date locale puis la convertit en ISO UTC
  // Ex: 18:00 local (France UTC+1) → "17:00:00.000Z" (UTC)
  const localDate = new Date(`${date}T${time}:00`);
  return localDate.toISOString();
}

export function extractDateLocal(isoString: string): string {
  return isoString.substring(0, 10);
}

export function extractTimeLocal(isoString: string): string {
  // Convertit UTC → heure locale (pour employés)
  // Ex: "2026-01-12T17:00:00.000Z" en UTC+1 → "18:00" local
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getMonday(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getSunday(date: Date = new Date()): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

export function getWeekDays(referenceDate: Date = new Date()): Date[] {
  const monday = getMonday(referenceDate);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    day.setHours(0, 0, 0, 0);
    return day;
  });
}
