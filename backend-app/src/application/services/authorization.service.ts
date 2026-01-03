import { ForbiddenError, NotFoundError } from "@/domain/error/AppError";
import { IUser } from "@/domain/interfaces/user.interface";
import { UserAuthDTO } from "@/application/DTOS";

/**
 * Service de gestion des autorisations et contrôles d'accès
 * Centralise toutes les vérifications de permissions métier
 */
export class AuthorizationService {

    constructor(private readonly R_user: IUser) {}

    // #region Manager Validation

    /**
     * Vérifie qu'un manager gère bien l'employé cible
     * Les admins passent toujours cette validation
     *
     * @param employeId - ID de l'employé à vérifier
     * @param authUser - Utilisateur authentifié
     * @throws ForbiddenError si le manager ne gère pas cet employé
     * @throws NotFoundError si l'employé n'existe pas
     */
    async validateManagerOwnership(employeId: number, authUser: UserAuthDTO): Promise<void> {
        if (authUser.role === 'manager') {
            const employee = await this.R_user.getEmployee_ById(employeId);
            if (!employee) {
                throw new NotFoundError(`Employé avec l'ID ${employeId} introuvable`);
            }
            if (employee.managerId !== authUser.id) {
                throw new ForbiddenError("Vous ne pouvez accéder qu'aux ressources de vos employés");
            }
        }
    }

    /**
     * Vérifie qu'un employé accède uniquement à ses propres ressources
     *
     * @param resourceOwnerId - ID du propriétaire de la ressource
     * @param authUser - Utilisateur authentifié
     * @throws ForbiddenError si l'employé n'est pas le propriétaire
     */
    validateEmployeeAccess(resourceOwnerId: number, authUser: UserAuthDTO): void {
        if (authUser.role === 'employe' && resourceOwnerId !== authUser.id) {
            throw new ForbiddenError("Vous ne pouvez accéder qu'à vos propres ressources");
        }
    }

    // #endregion
}
