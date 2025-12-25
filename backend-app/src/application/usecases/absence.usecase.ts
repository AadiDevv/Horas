import {
    AbsenceCreateDTO,
    AbsenceUpdateDTO,
    AbsenceValidateDTO,
    AbsenceFilterDTO,
    AuthContext
} from "@/application/DTOS";
import { Absence, Absence_Core, Absence_L1 } from "@/domain/entities/absence";
import { IAbsence } from "@/domain/interfaces/absence.interface";
import { IUser } from "@/domain/interfaces/user.interface";
import { NotFoundError, ForbiddenError, ValidationError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des absences (congés, absences, etc.)
 * Contient la logique métier et les règles de gestion
 *
 * Note: Les restrictions d'accès par rôle (ex: "manager uniquement") sont gérées
 * par les middlewares dans les routes. Ici, on gère uniquement la logique métier
 * (ex: un manager ne peut voir QUE ses employés).
 */
export class AbsenceUseCase {

    constructor(
        private readonly R_absence: IAbsence,
        private readonly R_user: IUser
    ) { }

    // #region Read

    /**
     * Récupère les absences selon le rôle de l'utilisateur
     *
     * Logique métier :
     * - Admin : peut filtrer toutes les absences
     * - Manager : peut filtrer uniquement les absences de SES employés
     * - Employé : ne peut voir que ses propres absences
     */
    async getAbsences(userRole: string, userId: number, filter?: AbsenceFilterDTO): Promise<Absence_Core[]> {
        let effectiveFilter: AbsenceFilterDTO = { ...filter };

        if (userRole === "employe") {
            // L'employé ne peut voir que ses propres absences
            effectiveFilter.employeId = userId;
        } else if (userRole === "manager") {
            // Si un employeId est spécifié, vérifier qu'il appartient au manager
            if (effectiveFilter.employeId) {
                const employee = await this.R_user.getEmployee_ById(effectiveFilter.employeId);
                if (!employee) {
                    throw new NotFoundError(`Employé avec l'ID ${effectiveFilter.employeId} introuvable`);
                }
                if (employee.managerId !== userId) {
                    throw new ForbiddenError("Vous ne pouvez pas accéder aux absences de cet employé");
                }
            }
            // Sinon, on retourne toutes les absences des employés du manager (géré côté filtre)
        }

        return await this.R_absence.getAllAbsences(effectiveFilter);
    }

    /**
     * Récupère une absence par son ID
     *
     * Logique métier :
     * - Employé : uniquement ses propres absences
     * - Manager : uniquement absences de SES employés
     * - Admin : toutes les absences
     */
    async getAbsenceById(id: number, userRole: string, userId: number): Promise<Absence> {
        const absence = await this.R_absence.getAbsence_ById(id);

        if (!absence) {
            throw new NotFoundError(`Absence avec l'ID ${id} introuvable`);
        }

        // Vérification des permissions selon la logique métier
        if (userRole === "employe" && absence.employeId !== userId) {
            throw new ForbiddenError("Accès interdit à cette absence");
        }

        if (userRole === "manager") {
            // Le manager ne peut voir que les absences de SES employés
            const employee = await this.R_user.getEmployee_ById(absence.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Accès interdit à cette absence");
            }
        }

        return absence;
    }

    /**
     * Récupère toutes les absences en attente pour un manager
     * (Route protégée par middleware manager/admin)
     */
    async getPendingAbsencesForManager(managerId: number): Promise<Absence[]> {
        return await this.R_absence.getPendingAbsences_ByManagerId(managerId);
    }

    // #endregion

    // #region Create

    /**
     * Crée une nouvelle absence avec logique métier
     *
     * Logique métier :
     * - Employé : crée pour lui-même, status = 'en_attente' forcé
     * - Manager : peut créer pour SES employés, peut définir le statut
     * - Admin : peut créer pour n'importe qui
     */
    async createAbsence(dto: AbsenceCreateDTO, auth: AuthContext): Promise<Absence_Core> {
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
                    throw new ForbiddenError("Vous ne pouvez pas créer une absence pour un employé qui n'est pas dans votre équipe");
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

        // Instancier l'entité Absence_Core
        const absence = new Absence_Core({
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
        absence.validate();
        return await this.R_absence.createAbsence(absence);
    }

    // #endregion

    // #region Update

    /**
     * Met à jour une absence
     *
     * Logique métier :
     * - Employé : peut modifier ses propres absences en statut 'en_attente' uniquement
     * - Manager : peut modifier les absences de SES employés en statut 'en_attente'
     * - Admin : peut tout modifier
     */
    async updateAbsence(id: number, dto: AbsenceUpdateDTO, auth: AuthContext): Promise<Absence_L1> {
        const { userRole, userId } = auth;

        // Récupérer l'absence existante
        const existing = await this.R_absence.getAbsence_ById(id);
        if (!existing) {
            throw new NotFoundError(`Absence avec l'ID ${id} introuvable`);
        }

        // Vérifications de permissions selon la logique métier
        if (userRole === "employe") {
            if (existing.employeId !== userId) {
                throw new ForbiddenError("Vous ne pouvez modifier que vos propres absences");
            }
            if (existing.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez modifier que les absences en attente");
            }
        }

        if (userRole === "manager") {
            const employee = await this.R_user.getEmployee_ById(existing.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez modifier que les absences de vos employés");
            }
            if (existing.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez modifier que les absences en attente");
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
        const updatedAbsence = new Absence_L1({
            ...existing,
            type: dto.type ?? existing.type,
            startDateTime,
            endDateTime,
            isFullDay: dto.isFullDay ?? existing.isFullDay,
            comments: dto.comments ?? existing.comments,
        });

        updatedAbsence.validate();
        return await this.R_absence.updateAbsence_ById(updatedAbsence);
    }

    /**
     * Valide ou refuse une absence
     * (Route protégée par middleware manager/admin)
     *
     * Logique métier :
     * - Manager : peut valider uniquement les absences de SES employés
     * - Admin : peut valider toutes les absences
     */
    async validateAbsence(id: number, dto: AbsenceValidateDTO, auth: AuthContext): Promise<Absence_L1> {
        const { userRole, userId } = auth;

        // Récupérer l'absence
        const absence = await this.R_absence.getAbsence_ById(id);
        if (!absence) {
            throw new NotFoundError(`Absence avec l'ID ${id} introuvable`);
        }

        // Vérifier que le manager est bien le manager de l'employé
        if (userRole === 'manager') {
            const employee = await this.R_user.getEmployee_ById(absence.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez valider que les absences de vos employés");
            }
        }

        // Vérifier que l'absence est en attente
        if (absence.status !== 'en_attente') {
            throw new ValidationError("Cette absence a déjà été traitée");
        }

        return await this.R_absence.validateAbsence(
            id,
            userId,
            dto.status,
            dto.comments
        );
    }

    // #endregion

    // #region Delete

    /**
     * Supprime une absence (soft delete)
     *
     * Logique métier :
     * - Employé : peut supprimer ses propres absences en statut 'en_attente'
     * - Manager : peut supprimer les absences de SES employés en statut 'en_attente'
     * - Admin : peut tout supprimer
     */
    async deleteAbsence(id: number, auth: AuthContext): Promise<void> {
        const { userRole, userId } = auth;

        const absence = await this.R_absence.getAbsence_ById(id);
        if (!absence) {
            throw new NotFoundError(`Absence avec l'ID ${id} introuvable`);
        }

        // Vérifications selon la logique métier
        if (userRole === "employe") {
            if (absence.employeId !== userId) {
                throw new ForbiddenError("Vous ne pouvez supprimer que vos propres absences");
            }
            if (absence.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez supprimer que les absences en attente");
            }
        }

        if (userRole === "manager") {
            const employee = await this.R_user.getEmployee_ById(absence.employeId);
            if (!employee || employee.managerId !== userId) {
                throw new ForbiddenError("Vous ne pouvez supprimer que les absences de vos employés");
            }
            if (absence.status !== 'en_attente') {
                throw new ForbiddenError("Vous ne pouvez supprimer que les absences en attente");
            }
        }

        await this.R_absence.deleteAbsence_ById(id);
    }

    // #endregion
}
