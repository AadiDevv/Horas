import { Exception, Exception_Core, Exception_L1 } from "@/domain/entities/exception";

/**
 * Interface du repository Exception
 * Définit le contrat pour les opérations CRUD sur les exceptions
 */
export interface IException {
    // #region Read

    /**
     * Récupère toutes les exceptions avec filtres optionnels
     * @param filter - Filtres optionnels (employeId, status, type, dates)
     */
    getAllExceptions(filter?: {
        employeId?: number;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Exception_Core[]>;

    /**
     * Récupère une exception par son ID
     */
    getException_ById(id: number): Promise<Exception | null>;

    /**
     * Récupère toutes les exceptions d'un employé
     * @param employeId - ID de l'employé
     */
    getExceptions_ByEmployeId(employeId: number): Promise<Exception[]>;

    /**
     * Récupère toutes les exceptions en attente de validation pour un manager
     * @param managerId - ID du manager
     */
    getPendingExceptions_ByManagerId(managerId: number): Promise<Exception[]>;

    // #endregion

    // #region Create

    /**
     * Crée une nouvelle exception
     * @param exception - Exception_Core (avant insertion, sans id ni jointures)
     * @returns Exception_Core (après insertion, avec id)
     */
    createException(exception: Exception_Core): Promise<Exception_Core>;

    // #endregion

    // #region Update

    /**
     * Met à jour une exception
     */
    updateException_ById(exception: Exception_L1): Promise<Exception_L1>;

    /**
     * Valide ou refuse une exception (manager)
     * @param id - ID de l'exception
     * @param validatedBy - ID du manager qui valide
     * @param status - Nouveau statut (approuve ou refuse)
     * @param comments - Commentaires optionnels
     */
    validateException(
        id: number,
        validatedBy: number,
        status: 'approuve' | 'refuse',
        comments?: string
    ): Promise<Exception_L1>;

    // #endregion

    // #region Delete

    /**
     * Supprime une exception par son ID (soft delete)
     */
    deleteException_ById(id: number): Promise<void>;

    // #endregion
}
