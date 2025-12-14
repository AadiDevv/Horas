import { UserAuthDTO, UserUpdateDTO } from "@/application/DTOS/";
import { UserEmployee, UserEmployee_Core, UserManager, User_Core } from "@/domain/entities/user";
import { IUser } from "@/domain/interfaces/user.interface";
import { NotFoundError, ForbiddenError, ValidationError } from "@/domain/error/AppError";
import { ITeam, ISchedule } from "@/domain/interfaces/";
import { UserMapper } from "../mappers/user";
/**
 * Use Case pour la gestion des utilisateurs (CRUD)
 * Contient la logique métier et les règles de gestion
 * 
 * Note : Les opérations d'authentification (register/login) sont dans AuthUseCase
 */
export class UserUseCase {

    constructor(
        private readonly R_user: IUser,
        private readonly R_team: ITeam,
        private readonly R_schedule: ISchedule
    ) { }

    // #region Read

    async getEmployee_ById(id: number): Promise<UserEmployee> {
        const employee: UserEmployee = await this.R_user.getEmployee_ById(id);
        if (!employee) {
            throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);
        }
        return new UserEmployee({ ...employee });
    }
    async getEmployeeCore_ById(id: number): Promise<UserEmployee_Core> {
        const employee: UserEmployee = await this.R_user.getEmployee_ById(id);
        if (!employee) {
            throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);
        }
        return new UserEmployee_Core({ ...employee });
    }

    async getManager_byId(id: number): Promise<UserManager> {
        const manager: UserManager = await this.R_user.getManager_ById(id);
        if (!manager) {
            throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);
        }
        return new UserManager({ ...manager });
    }
    async getUserCore_ById(id: number): Promise<User_Core> {
        const user = await this.R_user.getUser_ById(id);
        return new User_Core({ ...user });
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
    async updateUserProfile_ById(
        id: number,
        requestingUser: UserAuthDTO,
        dtoUserProfile: UserUpdateDTO
    ): Promise<User_Core> {

        // #region Validate
        // Récupération de l'utilisateur existant
        const existingUser = await this.getUserCore_ById(id);
        if (!existingUser) throw new NotFoundError(`Utilisateur avec l'ID ${id} introuvable`);


        // Cas Modifications User profile / il y a des données dans le UserUpdateDTO
        this.validateUpdateProfilePermissions(existingUser, dtoUserProfile, requestingUser);
        // #endregion
        // Mise à jour via la factory method
        const updatedUser = UserMapper.FromDTO.UpdateUser_ToEntity(existingUser, dtoUserProfile);

        // Validation métier
        updatedUser.validate();

        // Sauvegarde via le repository
        const userUpdated = await this.R_user.updateUserProfile_ById(updatedUser);
        return new User_Core({ ...userUpdated });
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
        targetUser: User_Core,
        dto: UserUpdateDTO,
        requestingUser: UserAuthDTO,
    ): Promise<void> {
        // Admin peut tout modifier
        if (requestingUser.role === 'admin') {
            return;
        }

        // Manager et Employé : restrictions strictes
        if (requestingUser.role === 'employe') {
            // Vérifier que c'est leur propre profil
            if (targetUser.id !== requestingUser.id) {
                throw new ForbiddenError("Vous ne pouvez modifier que votre propre profil");
            }
        } else if (requestingUser.role === 'manager') {

            // Si Le targetUser n'est pas son propre profil
            if (targetUser.id !== requestingUser.id) {
                // Si Le targetUser n'est pas un employé
                if (targetUser.role !== 'employe') {
                    throw new ForbiddenError("Vous ne pouvez modifier que des employés");
                }
                // Si Le targetUser n'est pas un employé du manager 
                const manager = await this.getManager_byId(requestingUser.id);
                if (!manager.employes.some(employee => employee.id === targetUser.id)) {
                    throw new ForbiddenError("L'utilisateur ne figure pas parmis vos employés");
                }
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
        user: UserAuthDTO
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

    /**
     * Assigne un custom schedule à un employé
     *
     * Règles métier :
     * - Admin : peut attribuer n'importe quel schedule à n'importe quel employé
     * - Manager : peut attribuer ses propres schedules à ses propres employés uniquement
     * - scheduleId null : retire le custom schedule (l'employé revient au schedule de son équipe)
     *
     * @param userId - ID de l'employé à qui attribuer le schedule
     * @param scheduleId - ID du schedule à attribuer (null pour retirer)
     * @param user - Utilisateur authentifié qui fait la requête (contient id et role)
     * @returns L'employé mis à jour
     * @throws NotFoundError si l'employé ou le schedule n'existe pas
     * @throws ForbiddenError si l'utilisateur n'a pas les droits
     * @throws ValidationError si l'employé n'est pas un employé (role manager/admin)
     */
    async updateUserCustomSchedule_ById(
        userId: number,
        scheduleId: number | null,
        user: UserAuthDTO
    ): Promise<UserEmployee_Core> {

        // #region Validation
        const targetUser = await this.getEmployeeCore_ById(userId);
        
        // Vérification que l'utilisateur existe et est bien un employé
        if (!targetUser) throw new NotFoundError(`L'employé avec l'ID ${userId} introuvable`);
        if (targetUser.role === 'admin' || targetUser.role === 'manager') {
            throw new ValidationError("Vous ne pouvez attribuer un custom schedule qu'à des employés");
        }

        // Si scheduleId est null, on retire le custom schedule (pas de validation du schedule)
        if (scheduleId !== null) {
            // Vérification que le schedule existe
            const targetSchedule = await this.R_schedule.getSchedule_ById(scheduleId);
            if (!targetSchedule) throw new NotFoundError(`Le schedule avec l'ID ${scheduleId} introuvable`);

            // Vérification que le schedule n'est pas déjà le custom schedule de l'employé
            if (targetUser.customScheduleId === scheduleId) {
                throw new ValidationError("L'employé a déjà ce custom schedule");
            }

            // En tant que manager, l'utilisateur ne peut attribuer que ses propres schedules à ses propres employés
            if (user.role !== 'admin') {
                // Vérifier que c'est son employé
                if (targetUser.managerId !== user.id) {
                    throw new ForbiddenError(
                        `Vous ne pouvez attribuer un custom schedule qu'à vos propres employés\n` +
                        `targetUser.managerId : ${targetUser.managerId}\n` +
                        `requestingUserId : ${user.id}`
                    );
                }
                // Vérifier que c'est son schedule
                if (targetSchedule.managerId !== user.id) {
                    throw new ForbiddenError(
                        `Impossible d'attribuer ce schedule. Vous n'êtes pas le manager de ce schedule`
                    );
                }
            }
        } else {
            // Si scheduleId est null, on retire le custom schedule
            // Vérifier que le manager a les droits sur cet employé
            if (user.role !== 'admin' && targetUser.managerId !== user.id) {
                throw new ForbiddenError("Vous ne pouvez retirer le custom schedule que de vos propres employés");
            }
        }
        // #endregion

        const userEntityUpdated = await this.R_user.updateUserCustomSchedule_ById(userId, scheduleId);
        return new UserEmployee_Core({ ...userEntityUpdated });
    }
    // #endregion

    // #region Delete
    /**
     * Suppression logique (soft delete) d'un utilisateur
     * Met à jour le champ deletedAt
     * 
     * Règles métier :
     * - Manager ou Admin uniquement
     * - Suppression logique (pas de suppression physique en BDD)
     * 
     * @param id - ID de l'utilisateur à supprimer
     * @throws NotFoundError si l'utilisateur n'existe pas
     */
    async deleteUser_ById(id: number, requestingUser: UserAuthDTO): Promise<void> {
        // 1 MANAGER
        if (requestingUser.role === 'manager') {
            // Cas 1 : Manager se supprime lui-même
            if (id === requestingUser.id) {
                await this.R_user.deleteUser_ById(id);
                return;
            }

            // Cas 2 : Manager supprime un de ses employés
            const user = await this.getEmployee_ById(id);

            if (user.role !== 'employe') {
                throw new ForbiddenError("Vous ne pouvez supprimer que des employés");
            }

            if (user.managerId !== requestingUser.id) {
                throw new ForbiddenError("Vous ne pouvez supprimer que vos propres employés");
            }

            await this.R_user.deleteUser_ById(id);
            return;
        }

        // 2️ ADMIN
        if (requestingUser.role === 'admin') {
            const user = await this.getUserCore_ById(id);

            if (user.role === 'admin') {
                throw new ForbiddenError("Vous ne pouvez pas supprimer un administrateur");
            }

            // TODO: Vérifier si manager a des équipes actives

            await this.R_user.deleteUser_ById(id);
            return;
        }
    }

    // #endregion
}
