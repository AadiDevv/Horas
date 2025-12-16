/**
 * @deprecated Ce service est obsolète. Utiliser timesheetService.ts à la place.
 * Les pointages sont maintenant appelés "timesheets" dans la nouvelle API.
 */

import { TimesheetReadDTO } from '../../types/backend-generated';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

export type ClockResponse = {
  success: boolean;
  data?: TimesheetReadDTO;
  message?: string;
  error?: string;
  timestamp?: string;
};

// Mock Data pour les timesheets
export const mockPointages: TimesheetReadDTO[] = [];

/**
 * API clock in/out - UNE SEULE ROUTE QUI TOGGLE AUTOMATIQUEMENT
 * Si le dernier timesheet est un clock in, cette route fera un clock out
 * Si le dernier timesheet est un clock out (ou s'il n'y a pas de timesheet), cette route fera un clock in
 */
export async function clockIn(): Promise<ClockResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayTimesheets = mockPointages.filter(p => {
      const pDate = new Date(p.timestamp);
      return pDate >= todayStart;
    });

    // Déterminer si c'est un clock in ou clock out en fonction du dernier timesheet
    let isClockIn = true;
    if (todayTimesheets.length > 0) {
      const lastTimesheet = todayTimesheets[todayTimesheets.length - 1];
      // Si le dernier est un clock in (true), alors celui-ci sera un clock out (false)
      isClockIn = !lastTimesheet.clockin;
    }

    const newTimesheet: TimesheetReadDTO = {
      id: mockPointages.length + 1,
      employeId: 1,
      timestamp: now.toISOString(),
      clockin: isClockIn,
      status: 'normal',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    mockPointages.push(newTimesheet);

    const action = isClockIn ? 'entrée' : 'sortie';
    console.log(`✅ Mock POST /api/timesheets/ (${action})`);
    console.log('📝 Nouveau timesheet:', newTimesheet);

    return {
      success: true,
      data: newTimesheet,
      message: `Pointage ${action} enregistré avec succès`,
      timestamp: now.toISOString()
    };
  }

  // MODE PRODUCTION : Utiliser la nouvelle API /api/timesheets/
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/timesheets/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({}) // Payload vide pour employé
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `HTTP ${res.status}`,
      timestamp: new Date().toISOString()
    };
  }
  
  const data = await res.json();
  return {
    success: true,
    data: data.data || data,
    message: data.message,
    timestamp: new Date().toISOString()
  };
}

/**
 * Récupère les timesheets du jour pour déterminer l'état actuel
 */
export async function getTodayPointages(): Promise<TimesheetReadDTO[]> {
  if (USE_MOCK) {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    return mockPointages.filter(p => {
      const pDate = new Date(p.timestamp);
      return pDate >= todayStart;
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/timesheets?startDate=${today}&endDate=${today}`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  const response = await res.json();
  return response.data || [];
}

/**
 * Récupère les timesheets de la semaine en cours
 */
export async function getWeekPointages(): Promise<TimesheetReadDTO[]> {
  if (USE_MOCK) {
    // Calculer le lundi de la semaine en cours
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si dimanche, -6, sinon 1 - jour
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Calculer le dimanche de la semaine en cours
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    console.log(`🔍 Récupération des timesheets de ${monday.toISOString()} à ${sunday.toISOString()}`);

    const weekTimesheets = mockPointages.filter(p => {
      const pDate = new Date(p.timestamp);
      return pDate >= monday && pDate <= sunday;
    });
    console.log(`✅ ${weekTimesheets.length} timesheets trouvés pour la semaine`);

    return weekTimesheets;
  }

  // Calculer les dates de début et fin de semaine
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const dateDebut = monday.toISOString().split('T')[0];
  const dateFin = sunday.toISOString().split('T')[0];

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/timesheets?startDate=${dateDebut}&endDate=${dateFin}`, {
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
  const response = await res.json();
  return response.data || [];
}
