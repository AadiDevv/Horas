import { Team, Team_Core, Team_L1 } from "@/domain/entities/team";
import { TeamFilterDTO } from "@/application/DTOS";

/**
 * Interface du repository Team
 * Définit le contrat pour les opérations CRUD sur les équipes
 */
export interface ITeam {
    // #region Read
    /**
     * Récupère toutes les équipes (Admin) ou filtre par managerId
     * @param filter - Filtres optionnels (managerId)
     */
    getAllTeams(filter?: TeamFilterDTO): Promise<Team_Core[]>;

    /**
     * Récupère une équipe par son ID
     */
    getTeam_ById(id: number): Promise<Team | null>;

    /**
     * Récupère les équipes d'un manager spécifique
     */
    getTeams_ByManagerId(managerId: number): Promise<Team_L1[]>;
    // #endregion

    // #region Create
    /**
     * Crée une nouvelle équipe
     */
    createTeam(team: Team_Core): Promise<Team_Core>;
    // #endregion

    // #region Update
    /**
     * Met à jour une équipe
     */
    updateTeam_ById(team: Team_Core): Promise<Team_Core>;

    /**
     * Met à jour la schedule d'une équipe
     */
    updateTeamSchedule_ById(teamId: number, scheduleId: number): Promise<Team_Core>;
    // #endregion

    // #region Delete
    /**
     * Suppression logique d'une équipe (soft delete)
     */
    deleteTeam_ById(id: number): Promise<Team_Core>;
    // #endregion
}

