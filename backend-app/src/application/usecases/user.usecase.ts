import { UserUpdateDTO } from "@/application/DTOS/";
import { User, UserEmployee, UserEmployee_Core } from "@/domain/entities/user";
import { IUser } from "@/domain/interfaces/user.interface";
import { NotFoundError, ForbiddenError } from "@/domain/error/AppError";
import { ITeam } from "@/domain/interfaces/team.interface";
import { UserMapper } from "../mappers/user";
import { UserEmployee_L1 } from "@/domain/entities/user";
/**
 * Use Case pour la gestion des utilisateurs (CRUD)
 * Contient la logique métier et les règles de gestion
 * 
 * Note : Les opérations d'authentification (register/login) sont dans AuthUseCase
 */
export class UserUseCase {

    constructor(private readonly R_user: IUser, private readonly R_team: ITeam) { }

    // #region Read

    /**
     * Récupère un utilisateur par son ID
     * 
     * @param id - ID de l'utilisateur
     * @returns L'utilisateur trouvé
     * @throws NotFoundError si l'utilisateur n'existe pas
     */
    async getEmployee_ById(id: number): Promise<UserEmployee> {
        const user = await this.R_user.getEmployee_ById(id);
        if (!user) {
            throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);
        }

        return new UserEmployee({ ...user });
    }
    async getEmployeeCore_ById(id: number): Promise<UserEmployee_Core> {
        const user = await this.getEmployee_ById(id);
        return new UserEmployee_Core({ ...user });
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
    ): Promise<UserEmployee_Core[]> {
        // Vérification des permissions
        if (requestingUserRole === "manager" && managerId !== requestingUserId) {
            throw new ForbiddenError("Vous ne pouvez consulter que vos propres employés");
        }

        const employees = await this.R_user.getEmployees_ByManagerId(managerId);
        return employees.map(employee => new UserEmployee_Core({ ...employee }));
    }
    // #endregion

    // #region Update
    /**
     * Met à jour un utilisateur existant
     * 
     * Règles métier :
     * - L'email ne peut pas être changé s'il est déjà utilisé par un autre utilisateur
     * - Les données sont validées via l'entité
     * - Restrictions basées sur le rôle de l'utilisateur connecté
     * 
     * @param id - ID de l'utilisateur à modifier
     * @param dtoUserProfile - Données de mise à jour
     * @param requestingUserId - ID de l'utilisateur qui fait la requête
     * @param requestingUserRole - Rôle de l'utilisateur connecté
     * @param teamId - ID de l'équipe (optionnel, pour assignation)
     * @param customScheduleId - ID du planning (optionnel, pour assignation)
     * @returns L'utilisateur mis à jour
     * @throws NotFoundError si l'utilisateur n'existe pas
     * @throws ValidationError si les données sont invalides ou restrictions non respectées
     * @throws ForbiddenError si l'utilisateur n'a pas les droits
     */
    async updateEmployeeProfile_ById(
        id: number,
        requestingUserId: number,
        requestingUserRole: string,
        dtoUserProfile: UserUpdateDTO
    ): Promise<UserEmployee_Core> {
        // #region Validate
        // Récupération de l'utilisateur existant
        const existingUser = await this.getEmployeeCore_ById(id);
        if (!existingUser) throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);

        if (existingUser.managerId !== requestingUserId) {
            throw new ForbiddenError("Vous ne pouvez modifier que votre propre profil");
        }
        // Cas Modifications User profile / il y a des données dans le UserUpdateDTO
        this.validateUpdateProfilePermissions(existingUser, dtoUserProfile, requestingUserId, requestingUserRole);
        // #endregion
        // Mise à jour via la factory method
        const updatedUser = UserMapper.FromDTO.UpdateEmployee_ToEntity(existingUser, dtoUserProfile);

        // Validation métier
        updatedUser.validate();

        // Sauvegarde via le repository
        const userUpdated = await this.R_user.updateEmployeeProfile_ById(updatedUser);
        return new UserEmployee_Core({ ...userUpdated });
    }

    /**
     * Valide les permissions de mise à jour selon le rôle
     * 
     * Règles métier :
     * - Admin : peut tout modifier (firstName, lastName, email, phone, role, isActive, teamId, customScheduleId)
     * - Manager : peut modifier son profil (firstName, lastName, email, phone uniquement)
     * - Employé : peut modifier son profil (firstName, lastName, email, phone uniquement)
     * 
     * Note : teamId et customScheduleId sont autorisés pour les admins via les routes dédiées
     */
    private async validateUpdateProfilePermissions(
        targetUser: UserEmployee_Core,
        dto: UserUpdateDTO,
        requestingUserId: number,
        requestingUserRole: string,
    ): Promise<void> {
        // Admin peut tout modifier
        if (requestingUserRole === 'admin') {
            return;
        }

        // Manager et Employé : restrictions strictes
        if (requestingUserRole === 'employe') {
            // Vérifier que c'est leur propre profil
            if (targetUser.id !== requestingUserId) {
                throw new ForbiddenError("Vous ne pouvez modifier que votre propre profil");
            }
        } else if (requestingUserRole === 'manager') {
            const employees: UserEmployee_Core[] = await this.R_user.getEmployees_ByManagerId(requestingUserId);
            if (!employees.some(employee => employee.id === targetUser.id)) {
                throw new ForbiddenError("Vous ne pouvez modifier que vos propres employés");
            }
        }
        // Champs interdits pour manager/employé
        const forbiddenFields: string[] = [];

        if (dto.role !== undefined) {
            forbiddenFields.push('role');
        }

        if (dto.isActive !== undefined) {
            forbiddenFields.push('isActive');
        }

        if (forbiddenFields.length > 0) {
            throw new ForbiddenError(
                `Vous n'avez pas le droit de modifier les champs suivants : ${forbiddenFields.join(', ')}. ` +
                `Seuls les administrateurs peuvent modifier ces informations.`
            );
        }

    }

    /**
     * Assigne un utilisateur à une équipe
     *
     * Règles métier :
     * - Admin : peut assigner n'importe quel utilisateur à n'importe quelle équipe
     * - Manager : peut uniquement assigner ses propres employés à ses équipes
     *
     * @param userId - ID de l'utilisateur à assigner
     * @param teamId - ID de l'équipe de destination
     * @param user - Utilisateur authentifié qui fait la requête (contient id et role)
     * @returns L'utilisateur mis à jour
     * @throws NotFoundError si l'utilisateur ou l'équipe n'existe pas
     * @throws ForbiddenError si l'utilisateur n'a pas les droits
     */
    async updateEmployeeTeam_ById(
        userId: number,
        teamId: number,
        user: UserEmployee_Core
    ): Promise<UserEmployee_Core> {

        // #region Validation
        const targetTeam = await this.R_team.getTeam_ById(teamId)
        const targetUser = await this.getEmployeeCore_ById(userId)
        // Vérification que l'équipe et l'utilisateur existent
        if (!targetTeam) throw new NotFoundError(`L'équipe avec l'ID ${teamId} introuvable`);
        if (!targetUser) throw new NotFoundError(`L'utilisateur avec l'ID ${userId} introuvable`);
        if (targetUser.role === 'admin' || targetUser.role === 'manager') throw new ForbiddenError("Vous ne pouvez assigner que des employés");
        if (targetUser.teamId === teamId) throw new ForbiddenError("L'utilisateur est déjà assigné à cette équipe");
        // En tant que manager, l'utilisateur ne peut assigner que ses propres employés à ses propreséquipes
        if (targetUser.managerId !== user.id) {
            throw new ForbiddenError(`Vous ne pouvez assigner que vos propres employé \n targetUser.managerId : ${targetUser.managerId} \n requestingUserId : ${user.id}`);
        }
        if (user.role !== 'admin' && user.id != targetTeam.managerId) {
            throw new ForbiddenError(`Impossible d'assigner l'utilisateur. Vous n'êtes pas le manager cette équipe`);
        }
        //#endregion
        const userEntityUpdated = await this.R_user.updateUserTeam_ById(userId, teamId);
        return new UserEmployee_Core({ ...userEntityUpdated });
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
    async deleteUser_ById(id: number, requestingUserId: number, requestingUserRole: string): Promise<void> {
        // Vérifier que l'utilisateur existe
        const user = await this.getEmployeeCore_ById(id);
        if (!user) throw new NotFoundError(`L'utilisateur avec l'ID ${id} introuvable`);

        if (requestingUserRole === 'manager') {

            // Vérifier que l'utilisateur a delete est un employee
            if (user.id !== requestingUserId) {
                if (user.role !== 'employe') throw new ForbiddenError("Vous ne pouvez supprimer que des employés");
            }

            // Manager que que delete ses propre employees
            if (user.managerId !== requestingUserId) throw new ForbiddenError("Vous ne pouvez supprimer que vos propres employés");

        } else if (requestingUserRole === 'admin') {
            if (user.role === 'admin') throw new ForbiddenError("Vous ne pouvez pas supprimer un administrateur");
        }

        // TODO: Règles métier additionnelles ?
        // - Interdire la suppression d'un manager qui a des équipes actives ?
        // - Interdire la suppression d'un employé qui a des timesheets en cours ?

        // Suppression logique via le repository
        await this.R_user.deleteUser_ById(id);
    }
    // #endregion
}
