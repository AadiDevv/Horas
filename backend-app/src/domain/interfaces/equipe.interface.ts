import { Equipe } from "@/domain/entities/equipe";
import { EquipeFilterDTO } from "@/application/DTOS";

/**
 * Interface du repository Equipe
 * Définit le contrat pour les opérations CRUD sur les équipes
 */
export interface IEquipe {
    // #region Read
    /**
     * Récupère toutes les équipes (Admin) ou filtre par managerId
     * @param filter - Filtres optionnels (managerId)
     */
    getAllEquipes(filter?: EquipeFilterDTO): Promise<Equipe[]>;

    /**
     * Récupère une équipe par son ID
     */
    getEquipe_ById(id: number): Promise<Equipe | null>;

    /**
     * Récupère les équipes d'un manager spécifique
     */
    getEquipes_ByManagerId(managerId: number): Promise<Equipe[]>;
    // #endregion

    // #region Create
    /**
     * Crée une nouvelle équipe
     */
    createEquipe(equipe: Equipe): Promise<Equipe>;
    // #endregion

    // #region Update
    /**
     * Met à jour une équipe
     */
    updateEquipe_ById(equipe: Equipe): Promise<Equipe>;
    // #endregion

    // #region Delete
    /**
     * Suppression logique d'une équipe (soft delete)
     */
    deleteEquipe_ById(id: number): Promise<Equipe>;
    // #endregion
}

