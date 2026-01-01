import { Horaire, ApiResponse } from '../types';

const API_BASE_URL = "http://localhost:8080";
const USE_MOCK = true;

interface Equipe {
  id: number;
  nom: string;
  description?: string;
  managerId?: number;
  horaires?: Horaire[];
}

// Mock Data - Horaires d'exemple
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

/**
 * Récupère les détails d'une équipe incluant ses horaires
 */
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

  const requete = await fetch(`${API_BASE_URL}/api/equipes/${equipeId}`);
  if (!requete.ok) {
    throw new Error("Erreur récupération équipe");
  }
  const equipe = await requete.json();
  return equipe;
}

/**
 * Récupère uniquement les horaires d'une équipe
 */
export async function getEquipeHoraires(equipeId: number): Promise<ApiResponse<Horaire[]>> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const equipe = mockEquipes.find(e => e.id === equipeId);
    const horaires = equipe?.horaires || [];

    console.log('🔍 Mock GET horaires pour équipe ' + equipeId);
    console.log('✅ Horaires:', horaires);

    return {
      success: true,
      data: horaires,
      message: "Horaires récupérés avec succès",
      timestamp: new Date().toISOString()
    };
  }

  // Récupère l'équipe complète et extrait les horaires
  const equipeResponse = await getEquipe(equipeId);
  if (equipeResponse.success && equipeResponse.data) {
    return {
      success: true,
      data: equipeResponse.data.horaires || [],
      message: "Horaires récupérés avec succès",
      timestamp: new Date().toISOString()
    };
  }

  return {
    success: false,
    message: "Impossible de récupérer les horaires",
    timestamp: new Date().toISOString()
  };
}
