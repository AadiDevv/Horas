/**
 * Configuration centralisée des styles pour les timelines du dashboard manager
 *
 * Ce fichier contient toutes les couleurs et styles utilisés dans WeeklyTimeline.tsx,
 * AbsencesCard.tsx et RetardsCard.tsx pour faciliter la maintenance et permettre
 * l'ajout de nouvelles variations.
 *
 * SYSTÈME HYBRIDE POUR LES ABSENCES:
 * - Chaque TYPE d'absence (maladie, congés, etc.) a sa propre couleur de FOND
 * - Le STATUT (en_attente, approuvé, etc.) détermine la couleur de BORDURE
 * - Exemple: "Congés en_attente" = fond BLEU + bordure ROUGE (attire l'attention)
 */

// ==================== TYPES ====================

export type TimesheetStatus = 'normal' | 'retard' | 'delay' | 'absence';
export type ClockType = 'entry' | 'exit';
export type AbsenceStatus = 'en_attente' | 'approuve' | 'refuse' | 'annule';
export type AbsenceType =
  | 'conges_payes'
  | 'conges_sans_solde'
  | 'maladie'
  | 'formation'
  | 'teletravail'
  | 'autre';

export interface BlockStyle {
  bgColor: string;
  textColor: string;
  borderColor?: string;
}

// ==================== BLOCS TIMESHEET (PAIRES) ====================

/**
 * Styles pour les blocs de pointage normaux (entrée + sortie)
 *
 * - normal: Pointage standard (noir)
 * - retard/delay: Pointage en retard (orange)
 * - absence: Pointage marqué comme absence (orange)
 */
export const TIMESHEET_BLOCK_STYLES: Record<TimesheetStatus, BlockStyle> = {
  normal: {
    bgColor: 'bg-black',
    textColor: 'text-white',
  },
  retard: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
  delay: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
  absence: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
};

// ==================== BLOCS ORPHELINS ====================

/**
 * Styles pour les blocs orphelins (pointage sans paire)
 *
 * - entry: Entrée seule sans sortie (gris clair)
 * - exit: Sortie seule sans entrée (gris foncé)
 * - retard/delay/absence: Même couleur que les paires (orange)
 */
export const ORPHAN_BLOCK_STYLES = {
  entry: {
    bgColor: 'bg-gray-400',
    textColor: 'text-white',
  },
  exit: {
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
  },
  retard: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
  delay: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
  absence: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
  },
} as const;

// ==================== BLOCS ABSENCE - SYSTÈME HYBRIDE ====================

/**
 * APPROCHE HYBRIDE (Choix du User):
 * - Chaque TYPE d'absence a sa propre couleur de FOND
 * - Le STATUT détermine la couleur de la BORDURE
 * - Exemple: Une "maladie en_attente" aura fond rouge + bordure rouge épaisse
 *           Une "congés en_attente" aura fond bleu + bordure rouge épaisse
 */

/**
 * Couleurs de FOND par TYPE d'absence
 * Chaque type est visuellement distinct pour faciliter l'identification
 */
export const ABSENCE_TYPE_STYLES: Record<AbsenceType, BlockStyle> = {
  conges_payes: {
    bgColor: 'bg-blue-400/60',      // Bleu pour congés payés
    textColor: 'text-white',
  },
  conges_sans_solde: {
    bgColor: 'bg-indigo-400/60',    // Indigo pour congés sans solde
    textColor: 'text-white',
  },
  maladie: {
    bgColor: 'bg-red-400/60',       // Rouge pour maladie
    textColor: 'text-white',
  },
  formation: {
    bgColor: 'bg-green-400/60',     // Vert pour formation
    textColor: 'text-white',
  },
  teletravail: {
    bgColor: 'bg-purple-400/60',    // Violet pour télétravail
    textColor: 'text-white',
  },
  autre: {
    bgColor: 'bg-gray-400/60',      // Gris pour autre
    textColor: 'text-white',
  },
};

/**
 * Couleurs de BORDURE par STATUT d'absence
 * Le statut "en_attente" a une bordure ROUGE (requête explicite du user)
 * pour attirer l'attention du manager sur les absences à valider
 * Les autres statuts n'ont pas de bordure visible
 */
export const ABSENCE_STATUS_BORDERS: Record<AbsenceStatus, string> = {
  en_attente: 'border-red-600 border border-2',      // ROUGE + épaisse pour attirer l'attention
  approuve: '',                                // Pas de bordure pour approuvé
  refuse: '',                                  // Pas de bordure pour refusé
  annule: '',                                  // Pas de bordure pour annulé
};

// ==================== LABELS TYPES ABSENCE ====================

/**
 * Labels d'affichage pour les types d'absence
 */
export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  conges_payes: 'Congés payés',
  conges_sans_solde: 'Congés sans solde',
  maladie: 'Maladie',
  formation: 'Formation',
  teletravail: 'Télétravail',
  autre: 'Autre',
};

// ==================== STYLES GLOBAUX TIMELINE ====================

/**
 * Styles pour les éléments UI de la timeline
 */
export const TIMELINE_UI_STYLES = {
  // Schedule d'équipe (zone grisée de fond)
  teamSchedule: {
    bgColor: 'rgba(51, 51, 51, 0.15)',
    textColor: 'text-gray-700',
  },

  // Grille de fond
  grid: {
    background: 'bg-gray-50',
    border: 'border-gray-200',
  },

  // Header des jours
  dayHeader: {
    today: 'bg-black text-white',
    other: 'bg-gray-100 text-gray-900',
  },

  // Indicateurs visuels
  outOfBounds: {
    border: 'border-yellow-400 sm:border-2',
    iconColor: 'text-yellow-300',
  },

  // Boutons
  deleteButton: 'bg-red-500 hover:bg-red-600',

  // Overlay de création
  creationOverlay: 'hover:bg-blue-50/50',
} as const;

// ==================== RETARDS PAR DURÉE ====================

/**
 * Seuils de durée pour la couleur des retards (en minutes)
 */
export const RETARD_DURATION_THRESHOLDS = {
  short: 5,    // <= 5 min
  medium: 15,  // <= 15 min
  // > 15 min = long
} as const;

/**
 * Couleurs pour les retards selon leur durée
 */
export const RETARD_DURATION_STYLES = {
  short: {
    bgColor: 'bg-yellow-400',
    textColor: 'text-white',
    hexColor: '#fbbf24',  // Pour SVG/Canvas
  },
  medium: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    hexColor: '#f97316',
  },
  long: {
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    hexColor: '#ef4444',
  },
} as const;

// ==================== MAPPING TAILWIND → HEX ====================

/**
 * Conversion des classes Tailwind vers HEX pour usage dans SVG/Canvas
 * (utilisé par AbsencesCard.tsx et autres composants graphiques)
 */
export const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-blue-400/90': '#60a5fa',
  'bg-indigo-400/90': '#818cf8',
  'bg-red-400/90': '#f87171',
  'bg-green-400/90': '#4ade80',
  'bg-purple-400/90': '#a78bfa',
  'bg-gray-400/90': '#9ca3af',
  'bg-orange-500': '#f97316',
  'bg-yellow-400': '#fbbf24',
  'bg-black': '#000000',
};

/**
 * Couleurs HEX directes pour les types d'absence
 * (utilisé par les composants qui nécessitent des valeurs HEX directes)
 */
export const ABSENCE_TYPE_HEX: Record<AbsenceType, string> = {
  conges_payes: '#60a5fa',       // Bleu
  conges_sans_solde: '#818cf8',  // Indigo
  maladie: '#f87171',            // Rouge
  formation: '#4ade80',          // Vert
  teletravail: '#a78bfa',        // Violet
  autre: '#9ca3af',              // Gris
};

// ==================== FONCTIONS UTILITAIRES ====================

/**
 * Récupère le style pour un bloc de pointage normal (paire)
 *
 * @param status - Statut du timesheet
 * @returns Style (bgColor, textColor)
 */
export function getTimesheetBlockStyle(status: TimesheetStatus): BlockStyle {
  return TIMESHEET_BLOCK_STYLES[status] || TIMESHEET_BLOCK_STYLES.normal;
}

/**
 * Récupère le style pour un bloc orphelin (sans paire)
 *
 * @param clockin - true = entrée, false = sortie
 * @param status - Statut du timesheet
 * @returns Style (bgColor, textColor)
 */
export function getOrphanBlockStyle(clockin: boolean, status: TimesheetStatus): BlockStyle {
  // Si retard/delay/absence, utiliser la couleur spéciale
  if (status === 'retard' || status === 'delay' || status === 'absence') {
    return ORPHAN_BLOCK_STYLES[status];
  }

  // Sinon, différencier par type (entrée/sortie)
  return ORPHAN_BLOCK_STYLES[clockin ? 'entry' : 'exit'];
}

/**
 * Récupère le style HYBRIDE pour un bloc d'absence (TYPE + STATUT)
 *
 * FONCTION PRINCIPALE pour les absences - Combine:
 * - Couleur de fond selon le TYPE (maladie, congés, etc.)
 * - Couleur de bordure selon le STATUT (en_attente, approuvé, etc.)
 *
 * @param type - Type d'absence (détermine la couleur de fond)
 * @param status - Statut administratif (détermine la couleur de bordure)
 * @returns Style complet avec bgColor, textColor, borderColor
 */
export function getAbsenceHybridStyle(type: AbsenceType, status: AbsenceStatus) {
  const typeStyle = ABSENCE_TYPE_STYLES[type] || ABSENCE_TYPE_STYLES.autre;
  const statusBorder = ABSENCE_STATUS_BORDERS[status] || ABSENCE_STATUS_BORDERS.refuse;

  return {
    bgColor: typeStyle.bgColor,        // Fond = TYPE
    textColor: typeStyle.textColor,    // Texte blanc
    borderColor: statusBorder,         // Bordure = STATUT
  };
}

/**
 * Récupère le style de fond pour un type d'absence uniquement
 * (Utile pour d'autres composants qui n'affichent que le type)
 *
 * @param type - Type d'absence
 * @returns Style (bgColor, textColor)
 */
export function getAbsenceTypeStyle(type: AbsenceType): BlockStyle {
  return ABSENCE_TYPE_STYLES[type] || ABSENCE_TYPE_STYLES.autre;
}

/**
 * Récupère la bordure pour un statut d'absence uniquement
 * (Utile si besoin de bordure seule)
 *
 * @param status - Statut administratif de l'absence
 * @returns Classes Tailwind de bordure
 */
export function getAbsenceStatusBorder(status: AbsenceStatus): string {
  return ABSENCE_STATUS_BORDERS[status] || ABSENCE_STATUS_BORDERS.refuse;
}

/**
 * Récupère le label d'affichage pour un type d'absence
 *
 * @param type - Type d'absence
 * @returns Label en français
 */
export function getAbsenceTypeLabel(type: AbsenceType): string {
  return ABSENCE_TYPE_LABELS[type] || 'Autre';
}

/**
 * Récupère le style pour un retard selon sa durée en minutes
 *
 * @param minutes - Durée du retard en minutes
 * @returns Style avec bgColor, textColor, hexColor
 */
export function getRetardDurationStyle(minutes: number) {
  if (minutes <= RETARD_DURATION_THRESHOLDS.short) {
    return RETARD_DURATION_STYLES.short;
  }
  if (minutes <= RETARD_DURATION_THRESHOLDS.medium) {
    return RETARD_DURATION_STYLES.medium;
  }
  return RETARD_DURATION_STYLES.long;
}

/**
 * Récupère la valeur HEX d'une classe Tailwind
 *
 * @param tailwindClass - Classe Tailwind (ex: 'bg-blue-400/90')
 * @returns Couleur HEX (ex: '#60a5fa')
 */
export function getTailwindHexColor(tailwindClass: string): string {
  return TAILWIND_TO_HEX[tailwindClass] || '#6b7280';
}

/**
 * Récupère la couleur HEX pour un type d'absence
 *
 * @param type - Type d'absence
 * @returns Couleur HEX
 */
export function getAbsenceTypeHexColor(type: AbsenceType): string {
  return ABSENCE_TYPE_HEX[type] || '#6b7280';
}

/**
 * Mapping inversé: du label français vers le type
 * (utilisé par AbsencesCard qui reçoit des labels formatés)
 */
const LABEL_TO_TYPE: Record<string, AbsenceType> = {
  'Congés payés': 'conges_payes',
  'Congés sans solde': 'conges_sans_solde',
  'Maladie': 'maladie',
  'Formation': 'formation',
  'Télétravail': 'teletravail',
  'Autre': 'autre',
};

/**
 * Récupère la couleur HEX à partir d'un label français ou d'un type
 * (utile pour les composants qui reçoivent des labels formatés)
 *
 * @param typeOrLabel - Type d'absence ou label français
 * @returns Couleur HEX
 */
export function getAbsenceColorFromLabelOrType(typeOrLabel: string): string {
  // Essayer d'abord comme type direct
  if (typeOrLabel in ABSENCE_TYPE_HEX) {
    return ABSENCE_TYPE_HEX[typeOrLabel as AbsenceType];
  }

  // Sinon, convertir le label en type
  const type = LABEL_TO_TYPE[typeOrLabel];
  if (type) {
    return ABSENCE_TYPE_HEX[type];
  }

  return '#6b7280'; // Fallback gris
}
