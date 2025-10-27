/**
 * Service pour gérer les timesheets via l'API Swagger
 * Routes: /api/timesheets
 */

const API_BASE_URL = "http://localhost:8080";

// ==================== TYPES ====================

export interface Timesheet {
  id: number;
  employeId: number;
  date: string; // Format: YYYY-MM-DD
  hour: string; // Format: ISO DateTime "2025-10-24T08:30:00.000Z"
  heure?: string; // Rétrocompatibilité (ancien format)
  clockin: boolean; // true = entrée, false = sortie
  status: 'normal' | 'retard' | 'absence';
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetStats {
  heuresJour: number; // Heures travaillées aujourd'hui
  heuresSemaine: number; // Heures travaillées cette semaine
  retardsMois: number; // Nombre de retards ce mois
  moyenneHebdo: number; // Moyenne d'heures par semaine
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// ==================== API CALLS ====================

/**
 * POST /api/timesheets/
 * Pointer automatiquement (entrée ou sortie)
 * L'API détermine automatiquement si c'est un clock-in ou clock-out
 */
export async function clockInOut(): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');

    // Générer la date et l'heure actuelles selon le format Swagger
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // "2025-10-24"
    const hour = now.toISOString(); // "2025-10-24T15:30:00.000Z"

    const body = {
      date: date,
      hour: hour,
      status: "normal"
    };

    console.log('🔄 POST /api/timesheets/ - Tentative de pointage...');
    console.log('📝 Token présent:', !!token);
    console.log('📅 Body:', body);

    const res = await fetch(`${API_BASE_URL}/api/timesheets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });

    console.log('📡 Response status:', res.status);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Erreur API:', errorData);
      throw new Error(errorData.message || errorData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ POST /api/timesheets/ - Réponse complète:', JSON.stringify(data, null, 2));
    console.log('📊 Type de data:', typeof data);
    console.log('🔍 data.data existe?', !!data.data);
    console.log('🔍 data.clockin existe?', !!data.clockin);

    // L'API peut retourner { success: true, data: { clockin: ... } }
    // ou directement { clockin: ... }
    const timesheet = data.data || data;

    console.log('📦 Timesheet extrait:', timesheet);

    return {
      success: true,
      data: timesheet,
      message: timesheet.clockin ? 'Entrée enregistrée' : 'Sortie enregistrée',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erreur clockInOut:', error);
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /api/timesheets
 * Liste des timesheets avec filtres optionnels
 * @param dateDebut Format: YYYY-MM-DD
 * @param dateFin Format: YYYY-MM-DD
 */
export async function getTimesheets(
  dateDebut?: string,
  dateFin?: string
): Promise<ApiResponse<Timesheet[]>> {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();

    if (dateDebut) params.append('dateDebut', dateDebut);
    if (dateFin) params.append('dateFin', dateFin);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/timesheets${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // L'API peut retourner directement un array ou un objet { data: [...] }
    const timesheets = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/timesheets - ${timesheets.length || 0} timesheets récupérés`);

    return {
      success: true,
      data: timesheets,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erreur getTimesheets:', error);
    return {
      success: false,
      data: [],
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /api/timesheets/{id}
 * Détail d'un timesheet
 */
export async function getTimesheet(id: number): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ GET /api/timesheets/${id} - Timesheet récupéré:`, data);

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erreur getTimesheet(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * PATCH /api/timesheets/{id}
 * Corriger un timesheet
 */
export async function updateTimesheet(
  id: number,
  updates: Partial<Pick<Timesheet, 'date' | 'heure' | 'clockin' | 'status'>>
): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ PATCH /api/timesheets/${id} - Timesheet mis à jour:`, data);

    return {
      success: true,
      data: data,
      message: 'Timesheet mis à jour avec succès',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erreur updateTimesheet(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * DELETE /api/timesheets/{id}
 * Supprimer un timesheet
 */
export async function deleteTimesheet(id: number): Promise<ApiResponse<void>> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/timesheets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    console.log(`✅ DELETE /api/timesheets/${id} - Timesheet supprimé`);

    return {
      success: true,
      message: 'Timesheet supprimé avec succès',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ Erreur deleteTimesheet(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * GET /api/timesheets/stats
 * Statistiques des timesheets
 */
export async function getTimesheetStats(): Promise<ApiResponse<TimesheetStats>> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/timesheets/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn(`⚠️ Stats API returned ${res.status}, using default values`);

      // Retourner des stats par défaut si l'API n'est pas prête
      return {
        success: true,
        data: {
          heuresJour: 0,
          heuresSemaine: 0,
          retardsMois: 0,
          moyenneHebdo: 0
        },
        message: 'Stats API unavailable, using defaults',
        timestamp: new Date().toISOString()
      };
    }

    const data = await res.json();
    console.log('✅ GET /api/timesheets/stats - Statistiques récupérées:', data);

    return {
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Erreur getTimesheetStats:', error);

    // Retourner des stats par défaut en cas d'erreur
    return {
      success: true,
      data: {
        heuresJour: 0,
        heuresSemaine: 0,
        retardsMois: 0,
        moyenneHebdo: 0
      },
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Récupère les timesheets du jour actuel
 */
export async function getTodayTimesheets(): Promise<ApiResponse<Timesheet[]>> {
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Récupération des timesheets du jour: ${today}`);
  return getTimesheets(today, today);
}

/**
 * Récupère les timesheets de la semaine en cours
 */
export async function getWeekTimesheets(): Promise<ApiResponse<Timesheet[]>> {
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

  const dateDebut = monday.toISOString().split('T')[0];
  const dateFin = sunday.toISOString().split('T')[0];

  console.log(`📅 Récupération des timesheets de ${dateDebut} à ${dateFin}`);

  return getTimesheets(dateDebut, dateFin);
}

/**
 * Vérifie si l'utilisateur est actuellement pointé (clock-in actif)
 */
export async function isCurrentlyClockedIn(): Promise<boolean> {
  const response = await getTodayTimesheets();

  if (!response.success || !response.data || response.data.length === 0) {
    return false;
  }

  // Trier par heure pour avoir le dernier pointage
  const sorted = [...response.data].sort((a, b) =>
    a.heure.localeCompare(b.heure)
  );

  const lastTimesheet = sorted[sorted.length - 1];

  // Si le dernier pointage est une entrée (clockin === true), on est pointé
  return lastTimesheet.clockin === true;
}
