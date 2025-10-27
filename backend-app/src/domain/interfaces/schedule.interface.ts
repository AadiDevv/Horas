import { Schedule } from "@/domain/entities/schedule";
import { ScheduleFilterDTO } from "@/application/DTOS";

/**
 * Interface du repository Schedule
 * Définit le contrat pour les opérations CRUD sur les horaires de travail
 */
export interface ISchedule {
    // #region Read
    /**
     * Récupère tous les schedules avec filtres optionnels
     * @param filter - Filtres (name, activeDays, etc.)
     */
    getAllSchedules(filter?: ScheduleFilterDTO): Promise<Schedule[]>;

    /**
     * Récupère un schedule par son ID
     */
    getSchedule_ById(id: number): Promise<Schedule | null>;

    /**
     * Récupère les schedules utilisés par une équipe spécifique
     */
    getSchedules_ByTeamId(teamId: number): Promise<Schedule[]>;
    // #endregion

    // #region Create
    /**
     * Crée un nouveau schedule
     */
    createSchedule(schedule: Schedule): Promise<Schedule>;
    // #endregion

    // #region Update
    /**
     * Met à jour un schedule
     */
    updateSchedule_ById(schedule: Schedule): Promise<Schedule>;
    // #endregion

    // #region Delete
    /**
     * Supprime un schedule (hard delete)
     * ⚠️ Attention : Vérifier qu'aucun utilisateur/équipe n'utilise ce schedule
     */
    deleteSchedule_ById(id: number): Promise<void>;
    // #endregion

    // #region Business Methods
    /**
     * Vérifie si un schedule est utilisé par des utilisateurs ou équipes
     */
    isScheduleInUse(id: number): Promise<boolean>;

    /**
     * Récupère le nombre d'utilisateurs utilisant un schedule
     */
    getScheduleUsersCount(id: number): Promise<number>;
    // #endregion
}

