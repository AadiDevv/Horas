import { User, UserEmployee, UserEmployee_Core, UserEmployee_L1 } from "@/domain/entities/user";
import { UserFilterDTO } from "@/application/DTOS/user.dto";

/**
 * Interface du repository User
 * Définit le contrat pour les opérations CRUD sur les utilisateurs
 * 
 * Note : Les opérations d'authentification (register/login) restent dans IAuth
 */
export interface IUser {
    // #region Read
    /**
     * Récupère tous les utilisateurs avec filtres optionnels
     * @param filter - Filtres (role, teamId, isActive, search)
     */

    /**
     * Récupère un utilisateur par son ID
     */
    getEmployee_ById(id: number): Promise<UserEmployee>;

    /**
     * Récupère tous les employés d'un manager spécifique
     * (JOIN sur les équipes : Team.managerId → Team.members)
     */
    getEmployees_ByManagerId(managerId: number): Promise<UserEmployee_Core[]>;
    // #endregion

    // #region Update
    /**
     * Met à jour un utilisateur
     * @param user - L'entité utilisateur mise à jour (avec son ID)
     */
    updateEmployeeProfile_ById(user: UserEmployee_Core): Promise<UserEmployee_Core>;
    /**
     * Met à jour un utilisateur
     * @param userId - ID de l'utilisateur à mettre à jour
     * @param teamId - ID de l'équipe à assigner
     */
    updateUserTeam_ById(userId: number, teamId: number): Promise<UserEmployee_Core>;


    // #endregion

    // #region Delete
    /**
     * Suppression logique d'un utilisateur (soft delete)
     */
    deleteUser_ById(id: number): Promise<UserEmployee_L1>;
    // #endregion
}

