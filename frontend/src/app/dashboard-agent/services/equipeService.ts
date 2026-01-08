import { Horaire, ApiResponse } from '../types';
import { apiClient } from '@/app/utils/apiClient';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = false;

interface Equipe {
  id: number;
  nom: string;
  description?: string;
  managerId?: number;
  horaires?: Horaire[];
}

const mockEquipes: Equipe[] = [
  {
    id: 1,
    nom: "Équipe Alpha",
    description: "Équipe principale de développement",
    managerId: 1,
    horaires: [
      { jour: 'Lundi', heureDebut: '09:00', heureFin: '17:00' },
      { jour: 'Mardi', heureDebut: '09:00', heureFin: '17:00' },
      { jour: 'Mercredi', heureDebut: '09:00', heureFin: '17:00' },
      { jour: 'Jeudi', heureDebut: '09:00', heureFin: '17:00' },
      { jour: 'Vendredi', heureDebut: '09:00', heureFin: '13:00' }
    ]
  },
  {
    id: 5,
    nom: "Équipe Beta",
    description: "Équipe support client",
    managerId: 2,
    horaires: [
      { jour: 'Lundi', heureDebut: '08:00', heureFin: '16:00' },
      { jour: 'Mardi', heureDebut: '08:00', heureFin: '16:00' },
      { jour: 'Mercredi', heureDebut: '08:00', heureFin: '18:00' },
      { jour: 'Jeudi', heureDebut: '08:00', heureFin: '16:00' },
      { jour: 'Vendredi', heureDebut: '08:00', heureFin: '16:00' }
    ]
  }
];

export async function getEquipe(equipeId: number): Promise<ApiResponse<Equipe>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const equipe = mockEquipes.find(e => e.id === equipeId);

    console.log('🔍 Mock GET /api/equipes/' + equipeId);
    console.log('✅ Réponse:', equipe);

    return {
      success: true,
      data: equipe,
      message: "Équipe récupérée avec succès",
      timestamp: new Date().toISOString()
    };
  }

  const requete = await apiClient.get(`${API_BASE_URL}/api/teams/${equipeId}`);

  if (!requete.ok) {
    throw new Error("Erreur récupération équipe");
  }

  const equipe = await requete.json();
  return equipe;
}

export async function getEquipeHoraires(equipeId: number): Promise<ApiResponse<Horaire[]>> {

  try {
    const res = await apiClient.get(`${API_BASE_URL}/api/teams/${equipeId}`);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: `Erreur ${res.status}`,
        timestamp: new Date().toISOString()
      };
    }

    const response = await res.json();

    const team = response.data || response;

    if (!team.schedule) {
      return {
        success: true,
        data: [],
        message: "Équipe sans horaires",
        timestamp: new Date().toISOString()
      };
    }


    const schedule = formatSchedule(team.schedule);

    return {
      success: true,
      data: schedule,
      message: "Horaires récupérés avec succès",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

export async function getUserSchedule(userId: number): Promise<ApiResponse<Horaire[]>> {
  try {
    const res = await apiClient.get(`${API_BASE_URL}/api/users/${userId}/schedule`);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        message: `Erreur ${res.status}`,
        timestamp: new Date().toISOString()
      };
    }

    const schedule = await res.json();
    const formattedSchedule = formatSchedule(schedule.data  || schedule);

    return {
      success: true,
      data: formattedSchedule,
      message: "Horaires récupérés avec succès",
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: (error as Error).message,
      timestamp: new Date().toISOString()
    };
  }
}

function formatSchedule(schedule: any): Horaire[] {

  const jourMapping: Record<number, string> = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
    7: 'Dimanche'
  };

  const formatTime = (time: string) => {
    if (!time) return '09:00';
    return time.substring(0, 5);
  };

  const horaires: Horaire[] = (schedule.activeDays || []).map((day: number) => ({
    jour: jourMapping[day],
    heureDebut: formatTime(schedule.startHour),
    heureFin: formatTime(schedule.endHour)
  }));


  return horaires;

}
