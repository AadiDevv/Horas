import { Absence, Absence_Core, Absence_L1 } from "@/domain/entities/absence";

/**
 * Interface du repository Absence
 * Définit le contrat pour les opérations CRUD sur les absences
 */
export interface IAbsence {
    // #region Read

    /**
     * Récupère toutes les absences avec filtres optionnels
     * @param filter - Filtres optionnels (employeId, status, type, dates)
     */
    getAllAbsences(filter?: {
        employeId?: number;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Absence_Core[]>;

    /**
     * Récupère une absence par son ID
     */
    getAbsence_ById(id: number): Promise<Absence | null>;

    /**
     * Récupère toutes les absences d'un employé
     * @param employeId - ID de l'employé
     */
    getAbsences_ByEmployeId(employeId: number): Promise<Absence[]>;

    /**
     * Récupère toutes les absences en attente de validation pour un manager
     * @param managerId - ID du manager
     */
    getPendingAbsences_ByManagerId(managerId: number): Promise<Absence[]>;

    // #endregion

    // #region Create

    /**
     * Crée une nouvelle absence
     * @param absence - Absence_Core (avant insertion, sans id ni jointures)
     * @returns Absence_Core (après insertion, avec id)
     */
    createAbsence(absence: Absence_Core): Promise<Absence_Core>;

    // #endregion

    // #region Update

    /**
     * Met à jour une absence
     */
    updateAbsence_ById(absence: Absence_L1): Promise<Absence_L1>;

    /**
     * Valide ou refuse une absence (manager)
     * @param id - ID de l'absence
     * @param validatedBy - ID du manager qui valide
     * @param status - Nouveau statut (approuve ou refuse)
     * @param comments - Commentaires optionnels
     */
    validateAbsence(
        id: number,
        validatedBy: number,
        status: 'approuve' | 'refuse',
        comments?: string
    ): Promise<Absence_L1>;

    // #endregion

    // #region Delete

    /**
     * Supprime une absence par son ID (soft delete)
     */
    deleteAbsence_ById(id: number): Promise<void>;

    // #endregion
}
