

import { formatDateLocal } from '@/app/utils/dateUtils';
import { API_CONFIG } from '@/constants/config';

const API_BASE_URL = API_CONFIG.BASE_URL;

export type AbsenceType = 'conges_payes' | 'conges_sans_solde' | 'maladie' | 'formation' | 'teletravail' | 'autre';
export type AbsenceStatus = 'en_attente' | 'approuve' | 'refuse' | 'annule';

export interface Absence {
  id: number;
  employeId: number;
  type: AbsenceType;
  status: AbsenceStatus;
  startDateTime: string;
  endDateTime: string;
  isFullDay: boolean;
  validatedBy: number | null;
  validatedAt: string | null;
  comments: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export async function getAbsences(params: {
  employeId?: number;
  status?: AbsenceStatus;
  type?: AbsenceType;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<Absence[]>> {
  try {
    const token = localStorage.getItem('token');
    const searchParams = new URLSearchParams();

    if (params.employeId) searchParams.append('employeId', params.employeId.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.type) searchParams.append('type', params.type);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/absences${queryString ? `?${queryString}` : ''}`;

    console.log('🔍 GET absences:', { url, params });

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
    const absences = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/absences - ${absences.length} absences récupérées`, absences);

    return {
      success: true,
      data: absences
    };
  } catch (error) {
    console.error('❌ Erreur getAbsences:', error);
    return {
      success: false,
      data: [],
      error: (error as Error).message
    };
  }
}

export async function getPendingAbsences(): Promise<ApiResponse<Absence[]>> {
  try {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/absences/pending`;

    console.log('🔍 GET pending absences:', url);

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
    const absences = Array.isArray(data) ? data : (data.data || []);

    console.log(`✅ GET /api/absences/pending - ${absences.length} absences en attente`, absences);

    return {
      success: true,
      data: absences
    };
  } catch (error) {
    console.error('❌ Erreur getPendingAbsences:', error);
    return {
      success: false,
      data: [],
      error: (error as Error).message
    };
  }
}

export async function createAbsence(absence: {
  employeId: number;
  type: AbsenceType;
  startDateTime: string;
  endDateTime: string;
  comments?: string;
  status?: AbsenceStatus;
}): Promise<ApiResponse<Absence>> {
  try {
    const token = localStorage.getItem('token');

    console.log('📝 POST /api/absences', absence);

    const res = await fetch(`${API_BASE_URL}/api/absences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        employeId: absence.employeId,
        type: absence.type,
        startDateTime: absence.startDateTime,
        endDateTime: absence.endDateTime,
        isFullDay: true,
        comments: absence.comments || null,
        status: absence.status || 'en_attente'
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Erreur backend POST:', { status: res.status, errorData });
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('✅ POST /api/absences - Absence créée', data);

    return {
      success: true,
      data: data.data || data,
      message: 'Absence créée avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur createAbsence:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export async function validateAbsence(
  id: number,
  status: 'approuve' | 'refuse',
  comments?: string
): Promise<ApiResponse<Absence>> {
  try {
    const token = localStorage.getItem('token');

    console.log(`🔧 PATCH /api/absences/${id}/validate`, { status, comments });

    const res = await fetch(`${API_BASE_URL}/api/absences/${id}/validate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status, comments })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Erreur backend PATCH:', { status: res.status, errorData });
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ PATCH /api/absences/${id}/validate - Absence validée`);

    return {
      success: true,
      data: data.data || data,
      message: 'Absence validée avec succès'
    };
  } catch (error) {
    console.error(`❌ Erreur validateAbsence(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

export async function deleteAbsence(id: number): Promise<ApiResponse<void>> {
  try {
    const token = localStorage.getItem('token');

    console.log(`🗑️ DELETE /api/absences/${id}`);

    const res = await fetch(`${API_BASE_URL}/api/absences/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Erreur backend DELETE:', errorData);
      console.error('❌ Status:', res.status);
      console.error('❌ StatusText:', res.statusText);
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    console.log(`✅ DELETE /api/absences/${id} - Absence supprimée`);

    return {
      success: true,
      message: 'Absence supprimée avec succès'
    };
  } catch (error) {
    console.error(`❌ Erreur deleteAbsence(${id}):`, error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

