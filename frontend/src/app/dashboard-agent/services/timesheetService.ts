

const API_BASE_URL = "http://localhost:8080";

export interface Timesheet {
  id: number;
  employeId: number;
  timestamp: string;
  clockin: boolean;
  status: 'normal' | 'retard' | 'absence' | 'delay';
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetStats {
  heuresJour: number;
  heuresSemaine: number;
  retardsMois: number;
  moyenneHebdo: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export async function clockInOut(): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');

    const body = { };

    console.log('🔄 POST /api/timesheets/ - Tentative de pointage...');
    console.log('📝 Token présent:', !!token);
    console.log('📅 Body (minimal):', body);

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

export async function getTimesheets(
  dateDebut?: string,
  dateFin?: string
): Promise<ApiResponse<Timesheet[]>> {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();

    if (dateDebut) params.append('startDate', dateDebut);
    if (dateFin) params.append('endDate', dateFin);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/timesheets${queryString ? `?${queryString}` : ''}`;

    console.log(`🔍 GET /api/timesheets - URL: ${url}`);

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

    const timesheets = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/timesheets - ${timesheets.length || 0} timesheets récupérés`, timesheets);

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

export async function updateTimesheet(
  id: number,
  updates: Partial<Pick<Timesheet, 'timestamp' | 'clockin' | 'status'>>
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

export async function getTodayTimesheets(): Promise<ApiResponse<Timesheet[]>> {
  const today = new Date().toISOString().split('T')[0];
  console.log(`📅 Récupération des timesheets du jour: ${today}`);
  return getTimesheets(today, today);
}

export async function getWeekTimesheets(weekStart?: Date): Promise<ApiResponse<Timesheet[]>> {

  let monday: Date;

  if (weekStart) {
    monday = new Date(weekStart);
    monday.setHours(0, 0, 0, 0);
  } else {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const dateDebut = monday.toISOString().split('T')[0];
  const dateFin = sunday.toISOString().split('T')[0];

  console.log(`📅 Récupération des timesheets de ${dateDebut} à ${dateFin}`);

  return getTimesheets(dateDebut, dateFin);
}

export async function isCurrentlyClockedIn(): Promise<boolean> {
  const response = await getTodayTimesheets();

  if (!response.success || !response.data || response.data.length === 0) {
    return false;
  }

  const sorted = [...response.data].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );

  const lastTimesheet = sorted[sorted.length - 1];

  return lastTimesheet.clockin === true;
}
