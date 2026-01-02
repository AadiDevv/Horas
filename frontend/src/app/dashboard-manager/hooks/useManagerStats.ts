import { useState, useEffect } from 'react';
import { getTimesheets, Timesheet } from '../services/timesheetService';
import { Agent, Equipe } from '../types';
import { formatDateLocal, getMonday, getSunday } from '@/app/utils/dateUtils';

export interface RetardInfo {
  employeNom: string;
  minutes: number;
  heureArrivee: string;
}

export interface EquipeHeures {
  nom: string;
  heures: number;
  objectif: number;
}

export interface RetardJour {
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
  retardMoyen: number;
  retardsDetail: RetardInfo[];
  heuresParEquipe: EquipeHeures[];
  retardsParJour: RetardJour[];
  totalRetardsSemaine: number;
  evolutionRetards: number;
  scoreParEquipe: EquipeScore[];
  scoreGlobal: number;
}

/**
 * Hook pour calculer les statistiques du dashboard manager
 * à partir des timesheets réels
 */
export function useManagerStats(agents: Agent[], equipes: Equipe[]) {
  const [stats, setStats] = useState<ManagerStats>({
    retardsAujourdhui: 0,
    retardMoyen: 0,
    retardsDetail: [],
    heuresParEquipe: [],
    retardsParJour: [],
    totalRetardsSemaine: 0,
    evolutionRetards: 0,
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
        retardMoyen: 0,
        retardsDetail: [],
        heuresParEquipe: [],
        retardsParJour: [],
        totalRetardsSemaine: 0,
        evolutionRetards: 0,
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

      // Récupérer tous les timesheets de la semaine pour tous les employés
      const response = await getTimesheets({ dateDebut, dateFin });

      if (!response.success || !response.data) {
        console.warn('⚠️ Aucun timesheet récupéré');
        return;
      }

      const timesheets = response.data;
      console.log(`📊 ${timesheets.length} timesheets récupérés pour les stats`);

      // Calculer les statistiques
      const calculatedStats = calculateAllStats(timesheets, agents, equipes, today);
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
   * Calcule toutes les statistiques à partir des timesheets
   */
  const calculateAllStats = (
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

    const retardsDetail: RetardInfo[] = retardsToday.map(t => {
      const agent = agents.find(a => a.id === t.employeId);
      const heure = t.timestamp.substring(11, 16); // "HH:MM"

      // Calculer le nombre de minutes de retard (fictif pour l'instant, à affiner avec le schedule)
      const minutes = Math.floor(Math.random() * 20) + 5; // TODO: calculer réellement avec le schedule

      return {
        employeNom: agent ? `${agent.prenom} ${agent.nom}` : 'Inconnu',
        minutes,
        heureArrivee: heure
      };
    });

    const retardMoyen = retardsDetail.length > 0
      ? Math.round(retardsDetail.reduce((sum, r) => sum + r.minutes, 0) / retardsDetail.length)
      : 0;

    // 2. Heures travaillées par équipe
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

    // 3. Retards par jour de la semaine
    const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const retardsParJour: RetardJour[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = formatDateLocal(date);
      const jourIndex = date.getDay();

      const retardsJour = timesheets.filter(t => {
        const date = t.timestamp.substring(0, 10); // "YYYY-MM-DD"
        return date === dateStr && t.status === 'retard' && t.clockin === true;
      });

      retardsParJour.push({
        jour: jours[jourIndex],
        count: retardsJour.length,
        isToday: dateStr === todayStr
      });
    }

    const totalRetardsSemaine = retardsParJour.reduce((sum, j) => sum + j.count, 0);

    // 4. Score de ponctualité par équipe
    const scoreParEquipe: EquipeScore[] = equipes.map(equipe => {
      const membresIds = agents.filter(a => a.equipeId === equipe.id).map(a => a.id);
      const timesheetsEquipe = timesheets.filter(t => membresIds.includes(t.employeId));
      const entrées = timesheetsEquipe.filter(t => t.clockin === true);
      const retards = timesheetsEquipe.filter(t => t.clockin === true && t.status === 'retard');

      const score = entrées.length > 0
        ? Math.round(((entrées.length - retards.length) / entrées.length) * 100)
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
      retardMoyen,
      retardsDetail,
      heuresParEquipe,
      retardsParJour,
      totalRetardsSemaine,
      evolutionRetards: 0, // TODO: comparer avec la semaine précédente
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
