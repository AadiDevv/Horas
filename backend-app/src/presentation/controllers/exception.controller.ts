import { Request, Response } from 'express';
import { ExceptionUseCase } from '@/application/usecases';
import {
    ExceptionFilterDTO,
    ExceptionCreateDTO,
    ExceptionUpdateDTO,
    ExceptionValidateDTO,
    ExceptionReadDTO,
    ExceptionListItemDTO
} from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { ExceptionMapper } from '@/application/mappers/';
import { ExceptionStatus, ExceptionType } from '@/domain/types';

/**
 * Contrôleur pour la gestion des exceptions (congés, absences, etc.)
 */
export class ExceptionController {
    constructor(private UC_exception: ExceptionUseCase) { }

    // #region Read

    /**
     * GET /api/exceptions
     * Récupère toutes les exceptions filtrées
     */
    async getExceptions(req: Request, res: Response): Promise<void> {
        const filter: ExceptionFilterDTO = {
            employeId: req.query.employeId ? Number(req.query.employeId) : undefined,
            status: req.query.status as ExceptionStatus,
            type: req.query.type as ExceptionType,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
        };

        const userId = req.user!.id;
        const userRole = req.user!.role;
        const exceptions = await this.UC_exception.getExceptions(userRole, userId, filter);
        const dto: ExceptionListItemDTO[] = exceptions.map(exception => ExceptionMapper.FromEntityCore.toReadDTO_Core(exception));

        res.success(dto, "Exceptions récupérées avec succès");
    }

    /**
     * GET /api/exceptions/:id
     * Récupère une exception par ID
     */
    async getExceptionById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const userId = req.user!.id;
        const userRole = req.user!.role;
        const exception = await this.UC_exception.getExceptionById(id, userRole, userId);
        const dto: ExceptionReadDTO = ExceptionMapper.FromEntity.toReadDTO(exception);

        res.success(dto, "Exception récupérée avec succès");
    }

    /**
     * GET /api/exceptions/pending
     * Récupère les exceptions en attente pour le manager connecté
     * (Route protégée par middleware manager/admin)
     */
    async getPendingExceptions(req: Request, res: Response): Promise<void> {
        const userId = req.user!.id;
        const exceptions = await this.UC_exception.getPendingExceptionsForManager(userId);
        const dto: ExceptionReadDTO[] = exceptions.map(exception => ExceptionMapper.FromEntity.toReadDTO(exception));

        res.success(dto, "Exceptions en attente récupérées avec succès");
    }

    // #endregion

    // #region Create

    /**
     * POST /api/exceptions
     * Crée une nouvelle exception
     * - Employee: crée pour lui-même, status = 'en_attente'
     * - Manager/Admin: peut créer pour ses employés
     */
    async createException(req: Request, res: Response): Promise<void> {
        const dto: ExceptionCreateDTO = req.body;

        // Validation basique des dates
        if (!dto.startDateTime || !dto.endDateTime) {
            throw new ValidationError("Les champs 'startDateTime' et 'endDateTime' sont requis");
        }

        if (isNaN(new Date(dto.startDateTime).getTime()) || isNaN(new Date(dto.endDateTime).getTime())) {
            throw new ValidationError("Les dates fournies sont invalides");
        }

        // Extraction du contexte d'authentification
        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        // Déléguer toute la logique métier au usecase
        const savedException = await this.UC_exception.createException(dto, auth);

        const responseDto = ExceptionMapper.FromEntityCore.toReadDTO_Core(savedException);
        res.success(responseDto, "Exception créée avec succès");
    }

    // #endregion

    // #region Update

    /**
     * PATCH /api/exceptions/:id
     * Met à jour une exception (statut 'en_attente' uniquement)
     */
    async updateException(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const dto: ExceptionUpdateDTO = req.body;
        if (!dto || Object.keys(dto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        const updated = await this.UC_exception.updateException(id, dto, auth);
        const updatedDTO = ExceptionMapper.FromEntityL1.toReadDTO_L1(updated);

        res.success(updatedDTO, "Exception modifiée avec succès");
    }

    /**
     * PATCH /api/exceptions/:id/validate
     * Valide ou refuse une exception (manager/admin uniquement)
     * (Route protégée par middleware manager/admin)
     */
    async validateException(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const dto: ExceptionValidateDTO = req.body;
        if (!dto.status || !['approuve', 'refuse'].includes(dto.status)) {
            throw new ValidationError("Le statut doit être 'approuve' ou 'refuse'");
        }

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        const validated = await this.UC_exception.validateException(id, dto, auth);
        const validatedDTO = ExceptionMapper.FromEntityL1.toReadDTO_L1(validated);

        res.success(validatedDTO, `Exception ${dto.status === 'approuve' ? 'approuvée' : 'refusée'} avec succès`);
    }

    // #endregion

    // #region Delete

    /**
     * DELETE /api/exceptions/:id
     * Supprime une exception (soft delete)
     */
    async deleteException(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        await this.UC_exception.deleteException(id, auth);

        res.success(null, "Exception supprimée avec succès");
    }

    // #endregion
}
