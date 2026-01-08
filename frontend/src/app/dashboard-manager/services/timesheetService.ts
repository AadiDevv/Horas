

import { apiClient } from '@/app/utils/apiClient';
import { formatDateLocal, getSunday } from '@/app/utils/dateUtils';
import { API_CONFIG } from '@/constants/config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface Timesheet {
  id: number;
  employeId: number;
  timestamp: string;
  clockin: boolean;
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

export async function updateTimesheet(
  id: number,
  updates: Partial<Pick<Timesheet, 'timestamp' | 'clockin' | 'status'>>
): Promise<ApiResponse<Timesheet>> {
  console.log(`🔧 PATCH /api/timesheets/${id}`, updates);

  const data = await apiClient.patch(`${API_BASE_URL}/api/timesheets/${id}`, updates);

  console.log(`✅ PATCH /api/timesheets/${id} - Timesheet mis à jour`);

  return {
    success: true,
    data: data.data || data,
    message: 'Timesheet mis à jour avec succès'
  };
}

export async function updateTimesheetPair(pairData: {
  entryId: number;
  exitId: number;
  entryTimestamp: string;
  exitTimestamp: string;
  status?: 'normal' | 'retard' | 'absence';
}): Promise<ApiResponse<{ entry: Timesheet; exit: Timesheet }>> {
  console.log('🔧 PATCH /api/timesheets/pair', pairData);

  const data = await apiClient.patch(`${API_BASE_URL}/api/timesheets/pair`, pairData);

  console.log('✅ PATCH /api/timesheets/pair - Paire mise à jour');

  return {
    success: true,
    data: data.data || data,
    message: 'Paire de timesheets mise à jour avec succès'
  };
}

export async function deleteTimesheet(id: number): Promise<ApiResponse<void>> {

  await apiClient.delete(`${API_BASE_URL}/api/timesheets/${id}`);

  console.log(`✅ DELETE /api/timesheets/${id} - Timesheet supprimé`);

  return {
    success: true,
    message: 'Timesheet supprimé avec succès'
  };
}

export async function createTimesheet(timesheet: {
  employeId: number;
  timestamp: string;
  status?: 'normal' | 'retard' | 'absence';
}): Promise<ApiResponse<Timesheet>> {

  const res = await apiClient.post(`${API_BASE_URL}/api/timesheets/`, {
    employeId: timesheet.employeId,
    timestamp: timesheet.timestamp,
    status: timesheet.status || 'normal'
  });

  const data = await res.json();
  console.log('✅ POST /api/timesheets/ - Timesheet créé', data);
  console.log('📝 Données du timesheet créé:', JSON.stringify(data, null, 2));

  return {
    success: true,
    data: data.data || data,
    message: 'Timesheet créé avec succès'
  };
}

export async function getEmployeeWeekTimesheets(
  employeId: number,
  weekStart: Date
): Promise<ApiResponse<Timesheet[]>> {
  const monday = new Date(weekStart);
  const sunday = getSunday(monday);

  const dateDebut = formatDateLocal(monday);
  const dateFin = formatDateLocal(sunday);

  return getTimesheets({ employeId, dateDebut, dateFin });
}
