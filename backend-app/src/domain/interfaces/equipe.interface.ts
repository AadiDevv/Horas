import { Team } from "@/domain/entities/team";
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
    getAllTeams(filter?: TeamFilterDTO): Promise<Team[]>;

    /**
     * Récupère une équipe par son ID
     */
    getTeam_ById(id: number): Promise<Team | null>;

    /**
     * Récupère les équipes d'un manager spécifique
     */
    getTeams_ByManagerId(managerId: number): Promise<Team[]>;
    // #endregion

    // #region Create
    /**
     * Crée une nouvelle équipe
     */
    createTeam(team: Team): Promise<Team>;
    // #endregion

    // #region Update
    /**
     * Met à jour une équipe
     */
    updateTeam_ById(team: Team): Promise<Team>;
    // #endregion

    // #region Delete
    /**
     * Suppression logique d'une équipe (soft delete)
     */
    deleteTeam_ById(id: number): Promise<Team>;
    // #endregion
}

