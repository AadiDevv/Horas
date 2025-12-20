import {
    ExceptionCreateDTO,
    ExceptionUpdateDTO,
    ExceptionValidateDTO,
    ExceptionFilterDTO,
    AuthContext
} from "@/application/DTOS";
import { Exception, Exception_Core, Exception_L1 } from "@/domain/entities/exception";
import { IException } from "@/domain/interfaces/exception.interface";
import { IUser } from "@/domain/interfaces/user.interface";
import { NotFoundError, ForbiddenError, ValidationError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des exceptions (congés, absences, etc.)
 * Contient la logique métier et les règles de gestion
 *
 * Note: Les restrictions d'accès par rôle (ex: "manager uniquement") sont gérées
 * par les middlewares dans les routes. Ici, on gère uniquement la logique métier
 * (ex: un manager ne peut voir QUE ses employés).
 */
export class ExceptionUseCase {

    constructor(
        private readonly R_exception: IException,
        private readonly R_user: IUser
    ) { }

    // #region Read

    /**
     * Récupère les exceptions selon le rôle de l'utilisateur
     *
     * Logique métier :
     * - Admin : peut filtrer toutes les exceptions
     * - Manager : peut filtrer uniquement les exceptions de SES employés
     * - Employé : ne peut voir que ses propres exceptions
     */
    async getExceptions(userRole: string, userId: number, filter?: ExceptionFilterDTO): Promise<Exception_Core[]> {
        let effectiveFilter: ExceptionFilterDTO = { ...filter };

        if (userRole === "employe") {
            // L'employé ne peut voir que ses propres exceptions
            effectiveFilter.employeId = userId;
        } else if (userRole === "manager") {
            // Si un employeId est spécifié, vérifier qu'il appartient au manager
            if (effectiveFilter.employeId) {
                const employee = await this.R_user.getEmployee_ById(effectiveFilter.employeId);
                if (!employee) {
                    throw new NotFoundError(`Employé avec l'ID ${effectiveFilter.employeId} introuvable`);
                }
                if (employee.managerId !== userId) {
                    throw new ForbiddenError("Vous ne pouvez pas accéder aux exceptions de cet employé");
                }
            }
            // Sinon, on retourne toutes les exceptions des employés du manager (géré côté filtre)
        }

        return await this.R_exception.getAllExceptions(effectiveFilter);
    }

    /**
     * Récupère une exception par son ID
     *
     * Logique métier :
     * - Employé : uniquement ses propres exceptions
     * - Manager : uniquement exceptions de SES employés
     * - Admin : toutes les exceptions
     */
    async getExceptionById(id: number, userRole: string, userId: number): Promise<Exception> {
        const exception = await this.R_exception.getException_ById(id);

        if (!exception) {
            throw new NotFoundError(`Exception avec l'ID ${id} introuvable`);
        }

        // Vérification des permissions selon la logique métier
        if (userRole === "employe" && exception.employeId !== userId) {
            throw new ForbiddenError("Accès interdit à cette exception");
        }

        if (userRole === "manager") {
            // Le manager ne peut voir que les exceptions de SES employés
            const employee = await this.R_user.getEmployee_ById(exception.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Accès interdit à cette exception");
            }
        }

        return exception;
    }

    /**
     * Récupère toutes les exceptions en attente pour un manager
     * (Route protégée par middleware manager/admin)
     */
    async getPendingExceptionsForManager(managerId: number): Promise<Exception[]> {
        return await this.R_exception.getPendingExceptions_ByManagerId(managerId);
    }

    // #endregion

    // #region Create

    /**
     * Crée une nouvelle exception avec logique métier
     *
     * Logique métier :
     * - Employé : crée pour lui-même, status = 'en_attente' forcé
     * - Manager : peut créer pour SES employés, peut définir le statut
     * - Admin : peut créer pour n'importe qui
     */
    async createException(dto: ExceptionCreateDTO, auth: AuthContext): Promise<Exception_Core> {
        const { userRole, userId } = auth;

        // Déterminer l'employé cible
        let targetEmployeeId: number;
        if (userRole === 'manager' || userRole === 'admin') {
            if (dto.employeId) {
                const employee = await this.R_user.getEmployee_ById(dto.employeId);
                if (!employee) {
                    throw new NotFoundError(`Employé avec l'ID ${dto.employeId} introuvable`);
                }
                // Le manager ne peut créer que pour SES employés
                if (userRole === 'manager' && employee.managerId !== userId) {
                    throw new ForbiddenError("Vous ne pouvez pas créer une exception pour un employé qui n'est pas dans votre équipe");
                }
                targetEmployeeId = dto.employeId;
            } else {
                throw new ValidationError("L'employé cible est requis");
            }
        } else {
            // Employé crée pour lui-même
            targetEmployeeId = userId;
        }

        // Valider les dates
        const startDateTime = new Date(dto.startDateTime);
        const endDateTime = new Date(dto.endDateTime);

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            throw new ValidationError("Les dates fournies sont invalides");
        }

        if (endDateTime < startDateTime) {
            throw new ValidationError("La date de fin doit être postérieure à la date de début");
        }

        // Déterminer le statut
        let status = dto.status || 'en_attente';
        if (userRole === 'employe') {
            // Un employé ne peut créer qu'en statut 'en_attente'
            status = 'en_attente';
        }

        // Instancier l'entité Exception_Core
        const exception = new Exception_Core({
            id: 0,
            employeId: targetEmployeeId,
            type: dto.type,
            status,
            startDateTime,
            endDateTime,
            isFullDay: dto.isFullDay ?? false,
            validatedBy: null,
            validatedAt: null,
            comments: dto.comments || null,
        });

        // Validation et enregistrement
        exception.validate();
        return await this.R_exception.createException(exception);
    }

    // #endregion

    // #region Update

    /**
     * Met à jour une exception
     *
     * Logique métier :
     * - Employé : peut modifier ses propres exceptions en statut 'en_attente' uniquement
     * - Manager : peut modifier les exceptions de SES employés en statut 'en_attente'
     * - Admin : peut tout modifier
     */
    async updateException(id: number, dto: ExceptionUpdateDTO, auth: AuthContext): Promise<Exception_L1> {
        const { userRole, userId } = auth;

        // Récupérer l'exception existante
        const existing = await this.R_exception.getException_ById(id);
        if (!existing) {
            throw new NotFoundError(`Exception avec l'ID ${id} introuvable`);
        }

        // Vérifications de permissions selon la logique métier
        if (userRole === "employe") {
            if (existing.employeId !== userId) {
                throw new ForbiddenError("Vous ne pouvez modifier que vos propres exceptions");
            }
            if (existing.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez modifier que les exceptions en attente");
            }
        }

        if (userRole === "manager") {
            const employee = await this.R_user.getEmployee_ById(existing.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez modifier que les exceptions de vos employés");
            }
            if (existing.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez modifier que les exceptions en attente");
            }
        }

        // Validation des dates si modifiées
        let startDateTime = existing.startDateTime;
        let endDateTime = existing.endDateTime;

        if (dto.startDateTime) {
            startDateTime = new Date(dto.startDateTime);
            if (isNaN(startDateTime.getTime())) {
                throw new ValidationError("La date de début est invalide");
            }
        }

        if (dto.endDateTime) {
            endDateTime = new Date(dto.endDateTime);
            if (isNaN(endDateTime.getTime())) {
                throw new ValidationError("La date de fin est invalide");
            }
        }

        if (endDateTime < startDateTime) {
            throw new ValidationError("La date de fin doit être postérieure à la date de début");
        }

        // Créer l'entité mise à jour
        const updatedException = new Exception_L1({
            ...existing,
            type: dto.type ?? existing.type,
            startDateTime,
            endDateTime,
            isFullDay: dto.isFullDay ?? existing.isFullDay,
            comments: dto.comments ?? existing.comments,
        });

        updatedException.validate();
        return await this.R_exception.updateException_ById(updatedException);
    }

    /**
     * Valide ou refuse une exception
     * (Route protégée par middleware manager/admin)
     *
     * Logique métier :
     * - Manager : peut valider uniquement les exceptions de SES employés
     * - Admin : peut valider toutes les exceptions
     */
    async validateException(id: number, dto: ExceptionValidateDTO, auth: AuthContext): Promise<Exception_L1> {
        const { userRole, userId } = auth;

        // Récupérer l'exception
        const exception = await this.R_exception.getException_ById(id);
        if (!exception) {
            throw new NotFoundError(`Exception avec l'ID ${id} introuvable`);
        }

        // Vérifier que le manager est bien le manager de l'employé
        if (userRole === 'manager') {
            const employee = await this.R_user.getEmployee_ById(exception.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez valider que les exceptions de vos employés");
            }
        }

        // Vérifier que l'exception est en attente
        if (exception.status !== 'en_attente') {
            throw new ValidationError("Cette exception a déjà été traitée");
        }

        return await this.R_exception.validateException(
            id,
            userId,
            dto.status,
            dto.comments
        );
    }

    // #endregion

    // #region Delete

    /**
     * Supprime une exception (soft delete)
     *
     * Logique métier :
     * - Employé : peut supprimer ses propres exceptions en statut 'en_attente'
     * - Manager : peut supprimer les exceptions de SES employés en statut 'en_attente'
     * - Admin : peut tout supprimer
     */
    async deleteException(id: number, auth: AuthContext): Promise<void> {
        const { userRole, userId } = auth;

        const exception = await this.R_exception.getException_ById(id);
        if (!exception) {
            throw new NotFoundError(`Exception avec l'ID ${id} introuvable`);
        }

        // Vérifications selon la logique métier
        if (userRole === "employe") {
            if (exception.employeId !== userId) {
                throw new ForbiddenError("Vous ne pouvez supprimer que vos propres exceptions");
            }
            if (exception.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez supprimer que les exceptions en attente");
            }
        }

        if (userRole === "manager") {
            const employee = await this.R_user.getEmployee_ById(exception.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez supprimer que les exceptions de vos employés");
            }
            if (exception.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez supprimer que les exceptions en attente");
            }
        }

        await this.R_exception.deleteException_ById(id);
    }

    // #endregion
}
