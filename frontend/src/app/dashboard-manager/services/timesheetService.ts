/**
 * Service pour gérer les timesheets côté manager
 * Permet de gérer les pointages de tous les employés
 */

const API_BASE_URL = "http://localhost:8080";

export interface Timesheet {
  id: number;
  employeId: number;
  date: string; // Format: YYYY-MM-DD
  hour: string; // Format: ISO DateTime "2025-10-24T08:30:00.000Z"
  clockin: boolean; // true = entrée, false = sortie
  status: 'normal' | 'retard' | 'absence';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * GET /api/timesheets
 * Récupère les timesheets avec filtres
 */
export async function getTimesheets(params: {
  employeId?: number;
  dateDebut?: string;
  dateFin?: string;
}): Promise<ApiResponse<Timesheet[]>> {
  try {
    const token = localStorage.getItem('token');
    const searchParams = new URLSearchParams();

    if (params.employeId) searchParams.append('employeId', params.employeId.toString());
    if (params.dateDebut) searchParams.append('startDate', params.dateDebut);
    if (params.dateFin) searchParams.append('endDate', params.dateFin);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/timesheets${queryString ? `?${queryString}` : ''}`;

    console.log('🔍 GET timesheets:', { url, params });

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const timesheets = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/timesheets - ${timesheets.length} timesheets récupérés`, timesheets);

    return {
      success: true,
      data: timesheets
    };
  } catch (error) {
    console.error('❌ Erreur getTimesheets:', error);
    return {
      success: false,
      data: [],
      error: (error as Error).message
    };
  }
}

/**
 * PATCH /api/timesheets/{id}
 * Met à jour un timesheet
 */
export async function updateTimesheet(
  id: number,
  updates: Partial<Pick<Timesheet, 'date' | 'hour' | 'clockin' | 'status'>>
): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');

    console.log(`🔧 PATCH /api/timesheets/${id}`, updates);

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
      console.error('❌ Erreur backend PATCH:', { status: res.status, errorData, sentData: updates });
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ PATCH /api/timesheets/${id} - Timesheet mis à jour`);

    return {
      success: true,
      data: data.data || data,
      message: 'Timesheet mis à jour avec succès'
    };
  } catch (error) {
    console.error(`❌ Erreur updateTimesheet(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * DELETE /api/timesheets/{id}
 * Supprime un timesheet
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
      message: 'Timesheet supprimé avec succès'
    };
  } catch (error) {
    console.error(`❌ Erreur deleteTimesheet(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * POST /api/timesheets/
 * Crée un nouveau timesheet (pour un employé)
 */
export async function createTimesheet(timesheet: {
  employeId: number;
  date: string;
  hour: string;
  clockin: boolean;
  status?: 'normal' | 'retard' | 'absence';
}): Promise<ApiResponse<Timesheet>> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/timesheets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        ...timesheet,
        status: timesheet.status || 'normal'
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ POST /api/timesheets/ - Timesheet créé', data);
    console.log('📝 Données du timesheet créé:', JSON.stringify(data, null, 2));

    return {
      success: true,
      data: data.data || data,
      message: 'Timesheet créé avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur createTimesheet:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Récupère les timesheets d'un employé pour une semaine
 */
export async function getEmployeeWeekTimesheets(
  employeId: number,
  weekStart: Date
): Promise<ApiResponse<Timesheet[]>> {
  const monday = new Date(weekStart);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const dateDebut = monday.toISOString().split('T')[0];
  const dateFin = sunday.toISOString().split('T')[0];

  return getTimesheets({ employeId, dateDebut, dateFin });
}
