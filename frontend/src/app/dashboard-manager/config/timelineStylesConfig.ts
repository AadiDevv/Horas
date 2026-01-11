

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

export const ABSENCE_STATUS_BORDERS: Record<AbsenceStatus, string> = {
  en_attente: 'border-red-600 border border-2',      // ROUGE + épaisse pour attirer l'attention
  approuve: '',                                // Pas de bordure pour approuvé
  refuse: '',                                  // Pas de bordure pour refusé
  annule: '',                                  // Pas de bordure pour annulé
};


export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  conges_payes: 'Congés payés',
  conges_sans_solde: 'Congés sans solde',
  maladie: 'Maladie',
  formation: 'Formation',
  teletravail: 'Télétravail',
  autre: 'Autre',
};


export const TIMELINE_UI_STYLES = {
  teamSchedule: {
    bgColor: 'rgba(51, 51, 51, 0.15)',
    textColor: 'text-gray-700',
  },

  grid: {
    background: 'bg-gray-50',
    border: 'border-gray-200',
  },

  dayHeader: {
    today: 'bg-black text-white',
    other: 'bg-gray-100 text-gray-900',
  },

  outOfBounds: {
    border: 'border-yellow-400 sm:border-2',
    iconColor: 'text-yellow-300',
  },

  deleteButton: 'bg-red-500 hover:bg-red-600',

  creationOverlay: 'hover:bg-blue-50/50',
} as const;


export const RETARD_DURATION_THRESHOLDS = {
  short: 5,    // <= 5 min
  medium: 15,  // <= 15 min
} as const;

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


export const TAILWIND_TO_HEX: Record<string, string> = {
  'bg-blue-400/90': '#60a5fa',
  'bg-indigo-400/90': '#818cf8',
  'bg-red-400/90': '#f87171',
  'bg-green-400/90': '#4ade80',
  'bg-purple-400/90': '#a78bfa',
  'bg-gray-400/90': '#9ca3af',
  'bg-orange-500': '#f97316',
  'bg-yellow-400': '#fbbf24',
  'bg-black': '#1a1a1a',
};

export const ABSENCE_TYPE_HEX: Record<AbsenceType, string> = {
  conges_payes: '#60a5fa',       // Bleu
  conges_sans_solde: '#818cf8',  // Indigo
  maladie: '#f87171',            // Rouge
  formation: '#4ade80',          // Vert
  teletravail: '#a78bfa',        // Violet
  autre: '#9ca3af',              // Gris
};


export function getTimesheetBlockStyle(status: TimesheetStatus): BlockStyle {
  return TIMESHEET_BLOCK_STYLES[status] || TIMESHEET_BLOCK_STYLES.normal;
}

export function getOrphanBlockStyle(clockin: boolean, status: TimesheetStatus): BlockStyle {
  if (status === 'retard' || status === 'delay' || status === 'absence') {
    return ORPHAN_BLOCK_STYLES[status];
  }

  return ORPHAN_BLOCK_STYLES[clockin ? 'entry' : 'exit'];
}

export function getAbsenceHybridStyle(type: AbsenceType, status: AbsenceStatus) {
  const typeStyle = ABSENCE_TYPE_STYLES[type] || ABSENCE_TYPE_STYLES.autre;
  const statusBorder = ABSENCE_STATUS_BORDERS[status] || ABSENCE_STATUS_BORDERS.refuse;

  return {
    bgColor: typeStyle.bgColor,        // Fond = TYPE
    textColor: typeStyle.textColor,    // Texte blanc
    borderColor: statusBorder,         // Bordure = STATUT
  };
}

export function getAbsenceTypeStyle(type: AbsenceType): BlockStyle {
  return ABSENCE_TYPE_STYLES[type] || ABSENCE_TYPE_STYLES.autre;
}

export function getAbsenceStatusBorder(status: AbsenceStatus): string {
  return ABSENCE_STATUS_BORDERS[status] || ABSENCE_STATUS_BORDERS.refuse;
}

export function getAbsenceTypeLabel(type: AbsenceType): string {
  return ABSENCE_TYPE_LABELS[type] || 'Autre';
}

export function getRetardDurationStyle(minutes: number) {
  if (minutes <= RETARD_DURATION_THRESHOLDS.short) {
    return RETARD_DURATION_STYLES.short;
  }
  if (minutes <= RETARD_DURATION_THRESHOLDS.medium) {
    return RETARD_DURATION_STYLES.medium;
  }
  return RETARD_DURATION_STYLES.long;
}

export function getTailwindHexColor(tailwindClass: string): string {
  return TAILWIND_TO_HEX[tailwindClass] || '#6b7280';
}

export function getAbsenceTypeHexColor(type: AbsenceType): string {
  return ABSENCE_TYPE_HEX[type] || '#6b7280';
}

const LABEL_TO_TYPE: Record<string, AbsenceType> = {
  'Congés payés': 'conges_payes',
  'Congés sans solde': 'conges_sans_solde',
  'Maladie': 'maladie',
  'Formation': 'formation',
  'Télétravail': 'teletravail',
  'Autre': 'autre',
};

export function getAbsenceColorFromLabelOrType(typeOrLabel: string): string {
  if (typeOrLabel in ABSENCE_TYPE_HEX) {
    return ABSENCE_TYPE_HEX[typeOrLabel as AbsenceType];
  }

  const type = LABEL_TO_TYPE[typeOrLabel];
  if (type) {
    return ABSENCE_TYPE_HEX[type];
  }

  return '#6b7280'; // Fallback gris
}
