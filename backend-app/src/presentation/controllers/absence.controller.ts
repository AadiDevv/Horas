import { Request, Response } from 'express';
import { AbsenceUseCase } from '@/application/usecases';
import {
    AbsenceFilterDTO,
    AbsenceCreateDTO,
    AbsenceUpdateDTO,
    AbsenceValidateDTO,
    AbsenceReadDTO,
    AbsenceListItemDTO
} from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { AbsenceMapper } from '@/application/mappers/';
import { AbsenceStatus, AbsenceType } from '@/domain/types';

/**
 * Contrôleur pour la gestion des absences (congés, absences, etc.)
 */
export class AbsenceController {
    constructor(private UC_absence: AbsenceUseCase) { }

    // #region Read

    /**
     * GET /api/absences
     * Récupère toutes les absences filtrées
     */
    async getAbsences(req: Request, res: Response): Promise<void> {
        const filter: AbsenceFilterDTO = {
            employeId: req.query.employeId ? Number(req.query.employeId) : undefined,
            status: req.query.status as AbsenceStatus,
            type: req.query.type as AbsenceType,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
        };

        const userId = req.user!.id;
        const userRole = req.user!.role;
        const absences = await this.UC_absence.getAbsences(userRole, userId, filter);
        const dto: AbsenceListItemDTO[] = absences.map((absence) => AbsenceMapper.FromEntityCore.toReadDTO_Core(absence));

        res.success(dto, "Absences récupérées avec succès");
    }

    /**
     * GET /api/absences/:id
     * Récupère une absence par ID
     */
    async getAbsenceById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const userId = req.user!.id;
        const userRole = req.user!.role;
        const absence = await this.UC_absence.getAbsenceById(id, userRole, userId);
        const dto: AbsenceReadDTO = AbsenceMapper.FromEntity.toReadDTO(absence);

        res.success(dto, "Absence récupérée avec succès");
    }

    /**
     * GET /api/absences/pending
     * Récupère les absences en attente pour le manager connecté
     * (Route protégée par middleware manager/admin)
     */
    async getPendingAbsences(req: Request, res: Response): Promise<void> {
        const userId = req.user!.id;
        const absences = await this.UC_absence.getPendingAbsencesForManager(userId);
        const dto: AbsenceReadDTO[] = absences.map((absence) => AbsenceMapper.FromEntity.toReadDTO(absence));

        res.success(dto, "Absences en attente récupérées avec succès");
    }

    // #endregion

    // #region Create

    /**
     * POST /api/absences
     * Crée une nouvelle absence
     * - Employee: crée pour lui-même, status = 'en_attente'
     * - Manager/Admin: peut créer pour ses employés
     */
    async createAbsence(req: Request, res: Response): Promise<void> {
        const dto: AbsenceCreateDTO = req.body;

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
        const savedAbsence = await this.UC_absence.createAbsence(dto, auth);

        const responseDto = AbsenceMapper.FromEntityCore.toReadDTO_Core(savedAbsence);
        res.success(responseDto, "Absence créée avec succès");
    }

    // #endregion

    // #region Update

    /**
     * PATCH /api/absences/:id
     * Met à jour une absence (statut 'en_attente' uniquement)
     */
    async updateAbsence(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const dto: AbsenceUpdateDTO = req.body;
        if (!dto || Object.keys(dto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        const updated = await this.UC_absence.updateAbsence(id, dto, auth);
        const updatedDTO = AbsenceMapper.FromEntityL1.toReadDTO_L1(updated);

        res.success(updatedDTO, "Absence modifiée avec succès");
    }

    /**
     * PATCH /api/absences/:id/validate
     * Valide ou refuse une absence (manager/admin uniquement)
     * (Route protégée par middleware manager/admin)
     */
    async validateAbsence(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const dto: AbsenceValidateDTO = req.body;
        if (!dto.status || !['approuve', 'refuse'].includes(dto.status)) {
            throw new ValidationError("Le statut doit être 'approuve' ou 'refuse'");
        }

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        const validated = await this.UC_absence.validateAbsence(id, dto, auth);
        const validatedDTO = AbsenceMapper.FromEntityL1.toReadDTO_L1(validated);

        res.success(validatedDTO, `Absence ${dto.status === 'approuve' ? 'approuvée' : 'refusée'} avec succès`);
    }

    // #endregion

    // #region Delete

    /**
     * DELETE /api/absences/:id
     * Supprime une absence (soft delete)
     */
    async deleteAbsence(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const auth = {
            userId: req.user!.id,
            userRole: req.user!.role,
        };

        await this.UC_absence.deleteAbsence(id, auth);

        res.success(null, "Absence supprimée avec succès");
    }

    // #endregion
}
