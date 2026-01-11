import { Request, Response } from 'express';
import { TimesheetUseCase } from '@/application/usecases';
import { TimesheetFilterDTO, TimesheetCreateDTO, TimesheetUpdateDTO, TimesheetPairUpdateDTO, TimesheetReadDTO, TimesheetListItemDTO, TimesheetStatsDTO } from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { TimesheetMapper } from '@/application/mappers/';

/**
 * Contrôleur pour la gestion des pointages (timesheets)
 */
export class TimesheetController {
    constructor(private UC_timesheet: TimesheetUseCase) { }

    // #region Read

    /**
     * GET /api/timesheets
     * Récupère tous les timesheets filtrés
     */
    async getTimesheets(req: Request, res: Response): Promise<void> {
        const filter: TimesheetFilterDTO = {
            employeId: req.query.employeId ? Number(req.query.employeId) : undefined,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            status: req.query.status as any,
            clockin: req.query.clockin ? req.query.clockin === 'true' : undefined,
        };

        const timesheets = await this.UC_timesheet.getTimesheets(req.user!, filter);
        const dto: TimesheetListItemDTO[] = timesheets.map(timesheet => TimesheetMapper.FromEntityCore.toReadDTO_Core(timesheet));

        res.success(dto, "Pointages récupérés avec succès");
    }

    /**
     * GET /api/timesheets/:id
     * Récupère un timesheet par ID
     */
    async getTimesheetById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const timesheet = await this.UC_timesheet.getTimesheetById(id, req.user!);
        const dto: TimesheetReadDTO = TimesheetMapper.FromEntity.toReadDTO(timesheet);

        res.success(dto, "Pointage récupéré avec succès");
    }

    /**
     * GET /api/timesheets/stats
     * Récupère les statistiques d'un employé sur une période
     */
    async getStats(req: Request, res: Response): Promise<void> {
        const employeId = Number(req.query.employeId);
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (isNaN(employeId) || !startDate || !endDate) {
            throw new ValidationError("employeId, startDate et endDate sont requis");
        }

        const stats: TimesheetStatsDTO = await this.UC_timesheet.getTimesheetStats(employeId, startDate, endDate, req.user!);
        res.success(stats, "Statistiques récupérées avec succès");
    }

    // #endregion

    // #region Create

    /**
     * POST /api/timesheets
     * Crée un nouveau pointage (clockin ou clockout automatique)
     * - Employee: crée pour lui-même (auto clockin/out)
     * - Manager/Admin: peut créer pour un employé spécifique avec clockin explicite
     */
    async createTimesheet(req: Request, res: Response): Promise<void> {
        const dto: TimesheetCreateDTO = req.body;

        // Validation basique du timestamp si fourni
        if (dto.timestamp && isNaN(new Date(dto.timestamp).getTime())) {
            throw new ValidationError("Le champ 'timestamp' doit être une date valide");
        }

        // Déléguer toute la logique métier au usecase (séparation auth/data)
        const savedTimesheet = await this.UC_timesheet.createTimesheet(dto, req.user!);

        const responseDto = TimesheetMapper.FromEntityCore.toReadDTO_Core(savedTimesheet);
        res.success(responseDto, `Pointage ${savedTimesheet.clockin ? 'entrée' : 'sortie'} enregistré avec succès`);
    }

    // #endregion

    // #region Update

    /**
     * PATCH /api/timesheets/pair
     * Met à jour une paire de timesheets (atomique)
     */
    async updateTimesheetPair(req: Request, res: Response): Promise<void> {
        const dto: TimesheetPairUpdateDTO = req.body;

        if (!dto.entryId || !dto.exitId || !dto.entryTimestamp || !dto.exitTimestamp) {
            throw new ValidationError("entryId, exitId, entryTimestamp et exitTimestamp sont requis");
        }


        const result = await this.UC_timesheet.updateTimesheetPair(dto, req.user!);

        res.success(
            {
                entry: TimesheetMapper.FromEntityL1.toReadDTO_L1(result.entry),
                exit: TimesheetMapper.FromEntityL1.toReadDTO_L1(result.exit)
            },
            "Paire de pointages modifiée avec succès"
        );
    }

    /**
     * PATCH /api/timesheets/:id
     * Met à jour un timesheet (admin/manager uniquement)
     */
    async updateTimesheet(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const dto: TimesheetUpdateDTO = req.body;
        if (!dto || Object.keys(dto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }

        const updated = await this.UC_timesheet.updateTimesheet(id, dto, req.user!);
        const updatedDTO = TimesheetMapper.FromEntityL1.toReadDTO_L1(updated);

        res.success(updatedDTO, "Pointage modifié avec succès");
    }

    // #endregion

    // #region Delete

    /**
     * DELETE /api/timesheets/:id
     * Supprime un timesheet (optionnel, selon les droits)
     */
    async deleteTimesheet(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        await this.UC_timesheet.deleteTimesheet(id, req.user!);

        res.success(null, "Pointage supprimé avec succès");
    }

    // #endregion
}
