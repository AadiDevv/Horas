import { useState, useEffect } from 'react';
import { getTimesheets, Timesheet } from '../services/timesheetService';
import { getAbsences, Absence } from '../services/absenceService';
import { Agent, Equipe } from '../types';
import { formatDateLocal, getMonday, getSunday } from '@/app/utils/dateUtils';

export interface AbsenceInfo {
  id: number;
  employeNom: string;
  type: string;
  dateDebut: string;
  dateFin: string;
}

export interface EquipeHeures {
  nom: string;
  heures: number;
  objectif: number;
}

export interface AbsenceJour {
  jour: string;
  count: number;
  isToday?: boolean;
}

export interface EquipeScore {
  nom: string;
  score: number;
}

export interface ManagerStats {
  retardsAujourdhui: number;
  absencesAujourdhui: number;
  absencesEnAttente: number;
  absencesDetail: AbsenceInfo[];
  heuresParEquipe: EquipeHeures[];
  absencesParJour: AbsenceJour[];
  totalAbsencesSemaine: number;
  evolutionAbsences: number;
  scoreParEquipe: EquipeScore[];
  scoreGlobal: number;
}

/**
 * Hook pour calculer les statistiques du dashboard manager
 * à partir des absences et timesheets
 */
export function useManagerStats(agents: Agent[], equipes: Equipe[]) {
  const [stats, setStats] = useState<ManagerStats>({
    retardsAujourdhui: 0,
    absencesAujourdhui: 0,
    absencesEnAttente: 0,
    absencesDetail: [],
    heuresParEquipe: [],
    absencesParJour: [],
    totalAbsencesSemaine: 0,
    evolutionAbsences: 0,
    scoreParEquipe: [],
    scoreGlobal: 100,
  });
  const [loading, setLoading] = useState(false);

  /**
   * Calcule la durée en heures entre deux timestamps
   */
  const calculateHours = (startISO: string, endISO: string): number => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    const diffMs = end.getTime() - start.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    // Validation
    if (hours < 0 || hours > 24) return 0;
    return hours;
  };

  /**
   * Charge et calcule toutes les statistiques
   */
  const loadStats = async () => {
    if (agents.length === 0) {
      setStats({
        retardsAujourdhui: 0,
        absencesAujourdhui: 0,
        absencesEnAttente: 0,
        absencesDetail: [],
        heuresParEquipe: [],
        absencesParJour: [],
        totalAbsencesSemaine: 0,
        evolutionAbsences: 0,
        scoreParEquipe: [],
        scoreGlobal: 100,
      });
      return;
    }

    setLoading(true);

    try {
      const today = new Date();
      const monday = getMonday(today);
      const sunday = getSunday(today);

      const dateDebut = formatDateLocal(monday);
      const dateFin = formatDateLocal(sunday);

      // Récupérer toutes les absences de la semaine
      const absencesResponse = await getAbsences({ startDate: dateDebut, endDate: dateFin });

      // Récupérer tous les timesheets de la semaine pour les heures travaillées
      const timesheetsResponse = await getTimesheets({ dateDebut, dateFin });

      if (!absencesResponse.success || !absencesResponse.data) {
        console.warn('⚠️ Aucune absence récupérée');
      }

      if (!timesheetsResponse.success || !timesheetsResponse.data) {
        console.warn('⚠️ Aucun timesheet récupéré');
      }

      // Filtrer les absences pour ne garder que celles des employés gérés par ce manager
      const agentIds = agents.map(a => a.id);
      const allAbsences = absencesResponse.data || [];
      const absences = allAbsences.filter(a => agentIds.includes(a.employeId));

      const timesheets = (timesheetsResponse.data || []) as any[];

      console.log(`📊 ${absences.length}/${allAbsences.length} absences (filtrées) et ${timesheets.length} timesheets récupérés pour les stats`);

      // Calculer les statistiques
      const calculatedStats = calculateAllStats(absences, timesheets, agents, equipes, today);
      setStats(calculatedStats);

      console.log('✅ Stats calculées:', calculatedStats);
    } catch (error) {
      console.error('❌ Erreur loadStats:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcule le lundi de la semaine
   */
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  };

  /**
   * Calcule toutes les statistiques à partir des absences et timesheets
   */
  const calculateAllStats = (
    absences: Absence[],
    timesheets: Timesheet[],
    agents: Agent[],
    equipes: Equipe[],
    today: Date
  ): ManagerStats => {
    const todayStr = formatDateLocal(today);
    const monday = getMonday(today);

    // 1. Retards aujourd'hui
    const retardsToday = timesheets.filter(t => {
      const date = t.timestamp.substring(0, 10); // "YYYY-MM-DD"
      return date === todayStr && t.status === 'retard' && t.clockin === true;
    });

    // 2. Absences aujourd'hui
    const absencesToday = absences.filter(a => {
      const startDate = a.startDateTime.substring(0, 10); // "YYYY-MM-DD"
      const endDate = a.endDateTime.substring(0, 10); // "YYYY-MM-DD"
      // Une absence est "aujourd'hui" si aujourd'hui est entre startDate et endDate
      return todayStr >= startDate && todayStr <= endDate && a.status === 'approuve';
    });

    const absencesDetail: AbsenceInfo[] = absencesToday.map(a => {
      const agent = agents.find(ag => ag.id === a.employeId);
      const dateDebut = a.startDateTime.substring(0, 10);
      const dateFin = a.endDateTime.substring(0, 10);

      // Mapper les types d'absence en français
      const typeMap: Record<string, string> = {
        'conges_payes': 'Congés payés',
        'conges_sans_solde': 'Congés sans solde',
        'maladie': 'Maladie',
        'formation': 'Formation',
        'teletravail': 'Télétravail',
        'autre': 'Autre'
      };

      return {
        id: a.id,
        employeNom: agent ? `${agent.prenom} ${agent.nom}` : 'Inconnu',
        type: typeMap[a.type] || a.type,
        dateDebut,
        dateFin
      };
    });

    // 3. Absences en attente de validation
    const absencesEnAttente = absences.filter(a => a.status === 'en_attente').length;

    // 4. Heures travaillées par équipe
    const heuresParEquipe: EquipeHeures[] = equipes.map(equipe => {
      const membresIds = agents.filter(a => a.equipeId === equipe.id).map(a => a.id);
      const timesheetsEquipe = timesheets.filter(t => membresIds.includes(t.employeId));

      // Grouper par employé et date
      const heuresByEmployeDate: Record<string, Timesheet[]> = {};
      timesheetsEquipe.forEach(t => {
        const date = t.timestamp.substring(0, 10); // "YYYY-MM-DD"
        const key = `${t.employeId}-${date}`;
        if (!heuresByEmployeDate[key]) heuresByEmployeDate[key] = [];
        heuresByEmployeDate[key].push(t);
      });

      let totalHeures = 0;

      // Calculer les heures pour chaque employé/jour
      Object.values(heuresByEmployeDate).forEach(dayTimesheets => {
        const sorted = [...dayTimesheets].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        for (let i = 0; i < sorted.length; i++) {
          const ts = sorted[i];
          if (ts.clockin === true) {
            const nextTs = sorted[i + 1];
            if (nextTs && nextTs.clockin === false) {
              totalHeures += calculateHours(ts.timestamp, nextTs.timestamp);
              i++; // Skip next
            }
          }
        }
      });

      return {
        nom: equipe.nom,
        heures: Math.round(totalHeures * 10) / 10,
        objectif: 40
      };
    });

    // 5. Absences par jour de la semaine
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const absencesParJour: AbsenceJour[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = formatDateLocal(date);
      const jourIndex = date.getDay();

      // Compter les absences qui touchent ce jour (approuvées uniquement)
      const absencesJour = absences.filter(a => {
        const startDate = a.startDateTime.substring(0, 10);
        const endDate = a.endDateTime.substring(0, 10);
        return dateStr >= startDate && dateStr <= endDate && a.status === 'approuve';
      });

      absencesParJour.push({
        jour: jours[jourIndex],
        count: absencesJour.length,
        isToday: dateStr === todayStr
      });
    }

    const totalAbsencesSemaine = absencesParJour.reduce((sum, j) => sum + j.count, 0);

    // 5. Score de ponctualité par équipe (basé sur les retards)
    const scoreParEquipe: EquipeScore[] = equipes.map(equipe => {
      const membresIds = agents.filter(a => a.equipeId === equipe.id).map(a => a.id);
      const timesheetsEquipe = timesheets.filter(t => membresIds.includes(t.employeId));

      // Compter les pointages de la semaine (clockin uniquement)
      const totalClockins = timesheetsEquipe.filter(t => t.clockin === true).length;

      // Compter les retards de la semaine
      const retardsEquipe = timesheetsEquipe.filter(t => t.clockin === true && t.status === 'retard').length;

      // Score de ponctualité = % de pointages à l'heure (sans retard)
      // Plus il y a de retards, plus le score baisse
      const score = totalClockins > 0
        ? Math.max(0, Math.round(((totalClockins - retardsEquipe) / totalClockins) * 100))
        : 100;

      return {
        nom: equipe.nom,
        score
      };
    });

    const scoreGlobal = scoreParEquipe.length > 0
      ? Math.round(scoreParEquipe.reduce((sum, e) => sum + e.score, 0) / scoreParEquipe.length)
      : 100;

    return {
      retardsAujourdhui: retardsToday.length,
      absencesAujourdhui: absencesToday.length,
      absencesEnAttente,
      absencesDetail,
      heuresParEquipe,
      absencesParJour,
      totalAbsencesSemaine,
      evolutionAbsences: 0, // TODO: comparer avec la semaine précédente
      scoreParEquipe,
      scoreGlobal
    };
  };

  // Charger les stats au montage et quand agents/equipes changent
  useEffect(() => {
    loadStats();
  }, [agents.length, equipes.length]);

  return {
    stats,
    loading,
    refreshStats: loadStats
  };
}
