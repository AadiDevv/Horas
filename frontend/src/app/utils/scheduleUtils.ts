import { Agent } from '../dashboard-manager/types';

/**
 * Utilitaires pour la gestion des horaires et calcul des retards
 * Utilisés dans le frontend pour calculer les minutes de retard en temps réel
 */

/**
 * Extrait uniquement le composant time-of-day d'un timestamp ISO
 * @param isoTimestamp - Timestamp ISO complet "2024-01-12T09:20:00.000Z"
 * @returns Date avec uniquement heures/minutes/secondes (date = epoch)
 */
export function extractTimeOfDay(isoTimestamp: string): Date {
  const date = new Date(isoTimestamp);
  const timeOnly = new Date(0); // Date epoch (1970-01-01T00:00:00Z)
  timeOnly.setHours(date.getHours());
  timeOnly.setMinutes(date.getMinutes());
  timeOnly.setSeconds(date.getSeconds());
  timeOnly.setMilliseconds(date.getMilliseconds());
  return timeOnly;
}

/**
 * Parse une chaîne de temps schedule vers une Date
 * @param timeString - Format "HH:mm:ss" ou "HH:mm"
 * @returns Date avec le time-of-day défini (date = epoch)
 */
export function parseScheduleTime(timeString: string): Date {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Format d'heure invalide: ${timeString}`);
  }

  const time = new Date(0); // Date epoch
  time.setHours(hours, minutes, seconds, 0);
  return time;
}

/**
 * Calcule le retard en minutes entre le clock-in et l'heure prévue
 * @param clockinTimestamp - Timestamp ISO du pointage
 * @param scheduledStartTime - Heure de début prévue "HH:mm:ss" ou "HH:mm"
 * @returns Nombre de minutes de retard (positif = retard, négatif = avance)
 */
export function calculateDelayMinutes(
  clockinTimestamp: string,
  scheduledStartTime: string
): number {
  const clockinTime = extractTimeOfDay(clockinTimestamp);
  const scheduledTime = parseScheduleTime(scheduledStartTime);

  const diffMs = clockinTime.getTime() - scheduledTime.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * Récupère l'horaire actif pour un agent
 * Priorité : customSchedule > team.schedule > null
 * @param agent - Agent avec customSchedule et team populated
 * @returns Schedule actif ou null si aucun n'est assigné
 */
export function getActiveSchedule(agent: Agent): {
  heureDebut: string;
  heureFin: string;
  activeDays: number[];
} | null {
  // Priorité 1 : Horaire personnalisé (override individuel)
  if (agent.customSchedule) {
    return {
      heureDebut: agent.customSchedule.heureDebut,
      heureFin: agent.customSchedule.heureFin,
      activeDays: agent.customSchedule.activeDays
    };
  }

  // Priorité 2 : Horaire d'équipe (défaut de l'équipe)
  if (agent.team?.schedule) {
    return {
      heureDebut: agent.team.schedule.heureDebut,
      heureFin: agent.team.schedule.heureFin,
      activeDays: agent.team.schedule.activeDays
    };
  }

  // Aucun horaire assigné
  return null;
}

/**
 * Convertit le numéro de jour JavaScript en numéro ISO 8601
 * JavaScript : 0=Dimanche, 1=Lundi, ..., 6=Samedi
 * ISO 8601 : 1=Lundi, 2=Mardi, ..., 7=Dimanche
 * @param jsDay - Jour JavaScript (0-6)
 * @returns Jour ISO 8601 (1-7)
 */
export function convertToISODay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Vérifie si une date est un jour actif dans l'horaire
 * @param dateString - Date au format "YYYY-MM-DD"
 * @param activeDays - Liste des jours actifs (ISO 8601: 1=Lun, 7=Dim)
 * @returns true si c'est un jour de travail, false sinon
 */
export function isActiveWorkDay(dateString: string, activeDays: number[]): boolean {
  // Créer une date sans tenir compte du timezone
  const date = new Date(dateString + 'T00:00:00');
  const jsDay = date.getDay();
  const isoDay = convertToISODay(jsDay);
  return activeDays.includes(isoDay);
}

/**
 * Vérifie si un employé devrait être présent maintenant selon son horaire
 * @param agent - Agent avec son schedule
 * @param currentTime - Heure actuelle (Date)
 * @param gracePeriodMinutes - Tolérance en minutes (défaut: 15)
 * @returns Object avec shouldBePresent, minutesLate, status
 */
export function checkEmployeePresence(
  agent: Agent,
  currentTime: Date = new Date(),
  gracePeriodMinutes: number = 15
): {
  shouldBePresent: boolean;
  minutesLate: number;
  status: 'on-time' | 'late' | 'absent' | 'not-scheduled';
} {
  const schedule = getActiveSchedule(agent);

  // Pas de schedule = pas de détection
  if (!schedule) {
    return {
      shouldBePresent: false,
      minutesLate: 0,
      status: 'not-scheduled'
    };
  }

  // Vérifier si c'est un jour de travail
  const jsDay = currentTime.getDay();
  const isoDay = convertToISODay(jsDay);
  const isWorkDay = schedule.activeDays.includes(isoDay);

  if (!isWorkDay) {
    return {
      shouldBePresent: false,
      minutesLate: 0,
      status: 'not-scheduled'
    };
  }

  // Extraire l'heure actuelle (time-of-day)
  const currentTimeOfDay = new Date(0);
  currentTimeOfDay.setHours(currentTime.getHours());
  currentTimeOfDay.setMinutes(currentTime.getMinutes());
  currentTimeOfDay.setSeconds(0);
  currentTimeOfDay.setMilliseconds(0);

  // Parser l'heure de début du schedule
  const scheduledStart = parseScheduleTime(schedule.heureDebut);

  // Calculer la différence en minutes
  const diffMs = currentTimeOfDay.getTime() - scheduledStart.getTime();
  const minutesLate = Math.floor(diffMs / (1000 * 60));

  // Déterminer le status
  if (minutesLate < 0) {
    // Pas encore l'heure de commencer
    return {
      shouldBePresent: false,
      minutesLate: 0,
      status: 'on-time'
    };
  } else if (minutesLate <= gracePeriodMinutes) {
    // Dans la période de tolérance
    return {
      shouldBePresent: true,
      minutesLate: 0,
      status: 'on-time'
    };
  } else {
    // En retard au-delà de la tolérance
    return {
      shouldBePresent: true,
      minutesLate,
      status: 'late'
    };
  }
}
