import { User } from "@/domain/entities/user";
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
    getAllUsers(filter?: UserFilterDTO): Promise<User[]>;

    /**
     * Récupère un utilisateur par son ID
     */
    getUser_ById(id: number): Promise<User | null>;

    /**
     * Récupère tous les employés d'un manager spécifique
     * (JOIN sur les équipes : Team.managerId → Team.members)
     */
    getEmployees_ByManagerId(managerId: number): Promise<User[]>;
    // #endregion

    // #region Update
    /**
     * Met à jour un utilisateur
     * @param user - L'entité utilisateur mise à jour (avec son ID)
     */
    updateUser_ById(user: User): Promise<User>;
    // #endregion

    // #region Delete
    /**
     * Suppression logique d'un utilisateur (soft delete)
     */
    deleteUser_ById(id: number): Promise<User>;
    // #endregion
}

