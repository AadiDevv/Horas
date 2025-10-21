import { PointageReadDTO, PointageCreateDTO } from '../../types/backend-generated';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

export type ClockResponse = {
  success: boolean;
  data?: PointageReadDTO;
  message?: string;
  error?: string;
  timestamp?: string;
};

// Mock Data pour les pointages
export const mockPointages: PointageReadDTO[] = [];

/**
 * API clock in/out - UNE SEULE ROUTE QUI TOGGLE AUTOMATIQUEMENT
 * Si le dernier pointage est un clock in, cette route fera un clock out
 * Si le dernier pointage est un clock out (ou s'il n'y a pas de pointage), cette route fera un clock in
 */
export async function clockIn(): Promise<ClockResponse> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const today = new Date().toISOString().split('T')[0];
    const todayPointages = mockPointages.filter(p => p.date === today);

    // Déterminer si c'est un clock in ou clock out en fonction du dernier pointage
    let isClockIn = true;
    if (todayPointages.length > 0) {
      const lastPointage = todayPointages[todayPointages.length - 1];
      // Si le dernier est un clock in (true), alors celui-ci sera un clock out (false)
      isClockIn = !lastPointage.clockin;
    }

    const newPointage: PointageReadDTO = {
      id: mockPointages.length + 1,
      employeId: 1,
      date: today,
      heure: new Date().toTimeString().split(' ')[0],
      clockin: isClockIn,
      status: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockPointages.push(newPointage);

    const action = isClockIn ? 'entrée' : 'sortie';
    console.log(`✅ Mock POST /api/pointages/clockin (${action})`);
    console.log('📝 Nouveau pointage:', newPointage);

    return {
      success: true,
      data: newPointage,
      message: `Pointage ${action} enregistré avec succès`,
      timestamp: new Date().toISOString()
    };
  }

  // MODE PRODUCTION : Une seule route qui toggle automatiquement
  const res = await fetch(`${API_BASE_URL}/api/pointages/clockin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
}

/**
 * Récupère les pointages du jour pour déterminer l'état actuel
 */
export async function getTodayPointages(): Promise<PointageReadDTO[]> {
  if (USE_MOCK) {
    const today = new Date().toISOString().split('T')[0];
    return mockPointages.filter(p => p.date === today);
  }

  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_BASE_URL}/api/pointages?date=${today}`);
  const response = await res.json();
  return response.data || [];
}

/**
 * Récupère les pointages de la semaine en cours
 */
export async function getWeekPointages(): Promise<PointageReadDTO[]> {
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

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    console.log(`🔍 Récupération des pointages de ${mondayStr} à ${sundayStr}`);

    const weekPointages = mockPointages.filter(p => p.date >= mondayStr && p.date <= sundayStr);
    console.log(`✅ ${weekPointages.length} pointages trouvés pour la semaine`);

    return weekPointages;
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

  const res = await fetch(`${API_BASE_URL}/api/pointages?dateDebut=${dateDebut}&dateFin=${dateFin}`);
  const response = await res.json();
  return response.data || [];
}
