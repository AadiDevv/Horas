import { Request, Response } from 'express';
import { ScheduleUseCase } from '@/application/usecases/schedule.usecase';
import {
    ScheduleCreateDTO,
    ScheduleUpdateDTO,
    ScheduleFilterDTO,
} from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { ScheduleMapper } from '@/application/mappers/schedule';

export class ScheduleController {
    constructor(private scheduleUseCase: ScheduleUseCase) { }

    // #region GET Routes
    /**
     * GET /api/schedules
     * Liste tous les schedules avec filtres optionnels
     * Admin uniquement
     */
    async getAllSchedules(req: Request, res: Response): Promise<void> {

        const filter: ScheduleFilterDTO = {
            name: req.query.name as string,
            activeDays: req.query.activeDays ?
                (req.query.activeDays as string).split(',').map(Number) :
                undefined
        };

        const schedules = await this.scheduleUseCase.getAllSchedules(req.user!, filter);
        const schedulesDTO = schedules.map(schedule => ScheduleMapper.FromEntityCore.toReadDTO_Core(schedule));
        res.success(schedulesDTO, "Liste des schedules récupérée avec succès");

    }

    /**
     * GET /api/schedules/:id
     * Récupère un schedule par son ID
     * Tous les utilisateurs authentifiés
     */
    async getSchedule_ById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new ValidationError("ID invalide");
        }

        const schedule = await this.scheduleUseCase.getSchedule_ById(id);
        const scheduleDTO = ScheduleMapper.FromEntity.toReadDTO(schedule);

        res.success(scheduleDTO, "Schedule récupéré avec succès");

    }

    /**
     * GET /api/schedules/team/:teamId
     * Récupère les schedules d'une équipe spécifique
     * Manager de l'équipe ou admin
     */
    async getSchedules_ByTeamId(req: Request, res: Response): Promise<void> {
        const teamId = Number(req.params.teamId);
        if (isNaN(teamId)) {
            throw new ValidationError("ID équipe invalide");
        }

        const schedules = await this.scheduleUseCase.getSchedules_ByTeamId(teamId);
        const schedulesDTO = schedules.map(schedule => ScheduleMapper.FromEntityCore.toReadDTO_Core(schedule));

        res.success(schedulesDTO, "Schedules récupérés avec succès");

    }


    // #endregion

    // #region POST Routes
    /**
     * POST /api/schedules
     * Crée un nouveau schedule
     * Admin uniquement
     */
    async createSchedule(req: Request, res: Response): Promise<void> {
        const dto: ScheduleCreateDTO = req.body;
        const managerId = req.user!.id

        const schedule = await this.scheduleUseCase.createSchedule(dto, managerId);
        const scheduleDTO = ScheduleMapper.FromEntityCore.toReadDTO_Core(schedule);
        res.success(scheduleDTO, "Schedule créé avec succès");
    }
    // #endregion

    // #region PATCH Routes
    /**
     * PATCH /api/schedules/:id
     * Met à jour un schedule existant
     * Admin uniquement
     */
    async updateSchedule_ById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new ValidationError("ID invalide");
        }

        const dto: ScheduleUpdateDTO = req.body;

        const schedule = await this.scheduleUseCase.updateSchedule_ById(id, dto, req.user!);
        const scheduleDTO = ScheduleMapper.FromEntityCore.toReadDTO_Core(schedule);

        res.success(scheduleDTO, "Schedule mis à jour avec succès");
    }


    // #endregion

    // #region DELETE Routes
    /**
     * DELETE /api/schedules/:id
     * Supprime un schedule
     * Admin uniquement
     */
    async deleteSchedule_ById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new ValidationError("ID invalide");
        }

        await this.scheduleUseCase.deleteSchedule_ById(id, req.user!);

        res.success("Schedule supprimé avec succès");
    }
    // #endregion
}

