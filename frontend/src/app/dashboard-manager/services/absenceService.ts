/**
 * Service pour gérer les absences côté manager
 */

import { formatDateLocal } from '@/app/utils/dateUtils';

const API_BASE_URL = "http://localhost:8080";

export type AbsenceType = 'conges_payes' | 'conges_sans_solde' | 'maladie' | 'formation' | 'teletravail' | 'autre';
export type AbsenceStatus = 'en_attente' | 'approuve' | 'refuse' | 'annule';

export interface Absence {
  id: number;
  employeId: number;
  type: AbsenceType;
  status: AbsenceStatus;
  startDateTime: string; // Format: ISO DateTime "2025-12-29T08:30:00.000Z"
  endDateTime: string;   // Format: ISO DateTime "2025-12-29T17:30:00.000Z"
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

/**
 * GET /api/absences
 * Récupère les absences avec filtres
 */
export async function getAbsences(params: {
  employeId?: number;
  status?: AbsenceStatus;
  type?: AbsenceType;
  startDate?: string; // Format: "YYYY-MM-DD"
  endDate?: string;   // Format: "YYYY-MM-DD"
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

/**
 * GET /api/absences/pending
 * Récupère les absences en attente de validation pour le manager
 */
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

/**
 * PATCH /api/absences/:id/validate
 * Valide ou refuse une absence
 */
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
