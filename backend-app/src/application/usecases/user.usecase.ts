import { UserUpdateDTO, UserFilterDTO } from "@/application/DTOS/user.dto";
import { User } from "@/domain/entities/user";
import { IUser } from "@/domain/interfaces/user.interface";
import { NotFoundError, ForbiddenError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des utilisateurs (CRUD)
 * Contient la logique métier et les règles de gestion
 * 
 * Note : Les opérations d'authentification (register/login) sont dans AuthUseCase
 */
export class UserUseCase {

    constructor(private readonly R_user: IUser) { }

    // #region Read
    /**
     * Récupère tous les utilisateurs avec filtres optionnels
     * Réservé aux Admins uniquement
     * 
     * @param filter - Filtres (role, teamId, isActive, search)
     * @returns Liste des utilisateurs
     */
    async getAllUsers(filter?: UserFilterDTO): Promise<User[]> {
        const users = await this.R_user.getAllUsers(filter);
        return users.map(user => new User(user));
    }

    /**
     * Récupère un utilisateur par son ID
     * 
     * @param id - ID de l'utilisateur
     * @returns L'utilisateur trouvé
     * @throws NotFoundError si l'utilisateur n'existe pas
     */
    async getUser_ById(id: number): Promise<User> {
        const user = await this.R_user.getUser_ById(id);
        if (!user) {
            throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);
        }

        return new User(user);
    }

    /**
     * Récupère tous les employés gérés par un manager
     * Effectue un JOIN : User.id → Team.managerId → Team.members
     * 
     * Logique métier :
     * - Manager : peut voir ses propres employés (managerId = userId depuis JWT)
     * - Admin : peut voir les employés de n'importe quel manager
     * 
     * @param managerId - ID du manager
     * @param requestingUserId - ID de l'utilisateur qui fait la requête (depuis JWT)
     * @param requestingUserRole - Rôle de l'utilisateur (depuis JWT)
     * @returns Liste des employés du manager
     * @throws ForbiddenError si un manager tente d'accéder aux employés d'un autre manager
     */
    async getMyEmployees(
        managerId: number,
        requestingUserId: number,
        requestingUserRole: string
    ): Promise<User[]> {
        // Vérification des permissions
        if (requestingUserRole === "manager" && managerId !== requestingUserId) {
            throw new ForbiddenError("Vous ne pouvez consulter que vos propres employés");
        }

        const employees = await this.R_user.getEmployees_ByManagerId(managerId);
        return employees.map(employee => new User({...employee}));
    }
    // #endregion

    // #region Update
    /**
     * Met à jour un utilisateur existant
     * 
     * Règles métier :
     * - L'email ne peut pas être changé s'il est déjà utilisé par un autre utilisateur
     * - Les données sont validées via l'entité
     * 
     * @param id - ID de l'utilisateur à modifier
     * @param dto - Données de mise à jour
     * @returns L'utilisateur mis à jour
     * @throws NotFoundError si l'utilisateur n'existe pas
     * @throws ValidationError si les données sont invalides
     */
    async updateUser_ById(id: number, dto: UserUpdateDTO): Promise<User> {
        // Récupération de l'utilisateur existant
        const existingUser = await this.getUser_ById(id);

        // Si l'email est modifié, vérifier qu'il n'est pas déjà utilisé
        // TODO: À implémenter si nécessaire via IAuth.getUser_ByEmail()

        // Mise à jour via la factory method
        const updatedUser = User.fromUpdateDTO(existingUser, dto);

        // Validation métier
        updatedUser.validateMe();

        // Sauvegarde via le repository
        const userUpdated = await this.R_user.updateUser_ById(updatedUser);
        return new User(userUpdated);
    }
    // #endregion

    // #region Delete
    /**
     * Suppression logique (soft delete) d'un utilisateur
     * Met à jour le champ deletedAt
     * 
     * Règles métier :
     * - Admin uniquement
     * - Suppression logique (pas de suppression physique en BDD)
     * 
     * @param id - ID de l'utilisateur à supprimer
     * @throws NotFoundError si l'utilisateur n'existe pas
     */
    async deleteUser_ById(id: number): Promise<void> {
        // Vérifier que l'utilisateur existe
        await this.getUser_ById(id);

        // TODO: Règles métier additionnelles ?
        // - Interdire la suppression d'un manager qui a des équipes actives ?
        // - Interdire la suppression d'un employé qui a des timesheets en cours ?

        // Suppression logique via le repository
        await this.R_user.deleteUser_ById(id);
    }
    // #endregion
}
