

import { TimesheetReadDTO as TimesheetReadDTO_Backend } from '../../types/backend-generated';
import { PointageReadDTO } from '../types';
import { API_CONFIG } from '@/constants/config';

const API_BASE_URL = API_CONFIG.BASE_URL;
const USE_MOCK = API_CONFIG.USE_MOCK;

function extractHeureFromTimestamp(timestamp: string): string {
  return timestamp.split('T')[1]?.substring(0, 8) || '00:00:00';
}

function transformToPointageReadDTO(data: TimesheetReadDTO_Backend): PointageReadDTO {
  return {
    ...data,
    heure: extractHeureFromTimestamp(data.timestamp)
  };
}

export type ClockResponse = {
  success: boolean;
  data?: PointageReadDTO;
  message?: string;
  error?: string;
  timestamp?: string;
};

export const mockPointages: PointageReadDTO[] = [];

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

    let isClockIn = true;
    if (todayTimesheets.length > 0) {
      const lastTimesheet = todayTimesheets[todayTimesheets.length - 1];

      isClockIn = !lastTimesheet.clockin;
    }

    const newTimesheet: PointageReadDTO = {
      id: mockPointages.length + 1,
      employeId: 1,
      timestamp: now.toISOString(),
      heure: extractHeureFromTimestamp(now.toISOString()),
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

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/timesheets/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    body: JSON.stringify({})
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
  const backendData = data.data || data;
  return {
    success: true,
    data: backendData ? transformToPointageReadDTO(backendData) : undefined,
    message: data.message,
    timestamp: new Date().toISOString()
  };
}

export async function getTodayPointages(): Promise<PointageReadDTO[]> {
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
  const backendData: TimesheetReadDTO_Backend[] = response.data || [];
  return backendData.map(transformToPointageReadDTO);
}

export async function getWeekPointages(): Promise<PointageReadDTO[]> {
  if (USE_MOCK) {

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

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
  const backendData: TimesheetReadDTO_Backend[] = response.data || [];
  return backendData.map(transformToPointageReadDTO);
}
