import { Request, Response } from 'express';
import { ScheduleUseCase } from '@/application/usecases/schedule.usecase';
import {
    ScheduleCreateDTO,
    ScheduleUpdateDTO,
    ScheduleFilterDTO
} from '@/application/DTOS';
import { ValidationError, NotFoundError, ForbiddenError } from '@/domain/error/AppError';

export class ScheduleController {
    constructor(private scheduleUseCase: ScheduleUseCase) { }

    // #region GET Routes
    /**
     * GET /api/schedules
     * Liste tous les schedules avec filtres optionnels
     * Admin uniquement
     */
    async getAllSchedules(req: Request, res: Response): Promise<void> {
        try {
            const filter: ScheduleFilterDTO = {
                name: req.query.name as string,
                activeDays: req.query.activeDays ?
                    (req.query.activeDays as string).split(',').map(Number) :
                    undefined
            };

            const schedules = await this.scheduleUseCase.getAllSchedules(filter);

            res.status(200).json({
                success: true,
                data: schedules,
                count: schedules.length
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }

    /**
     * GET /api/schedules/:id
     * Récupère un schedule par son ID
     * Tous les utilisateurs authentifiés
     */
    async getSchedule_ById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const includeUsers = req.query.include === 'users';
            let schedule;

            if (includeUsers) {
                schedule = await this.scheduleUseCase.getScheduleWithUsers(id);
            } else {
                schedule = await this.scheduleUseCase.getSchedule_ById(id);
            }

            res.status(200).json({
                success: true,
                data: schedule
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }

    /**
     * GET /api/schedules/user/:userId
     * Récupère les schedules d'un utilisateur spécifique
     * Utilisateur lui-même, son manager ou admin
     */
    async getSchedules_ByUserId(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID utilisateur invalide'
                });
                return;
            }

            const schedules = await this.scheduleUseCase.getSchedules_ByUserId(userId);

            res.status(200).json({
                success: true,
                data: schedules,
                count: schedules.length
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }

    /**
     * GET /api/schedules/team/:teamId
     * Récupère les schedules d'une équipe spécifique
     * Manager de l'équipe ou admin
     */
    async getSchedules_ByTeamId(req: Request, res: Response): Promise<void> {
        try {
            const teamId = parseInt(req.params.teamId);
            if (isNaN(teamId)) {
                res.status(400).json({
                    success: false,
                    message: 'ID équipe invalide'
                });
                return;
            }

            const schedules = await this.scheduleUseCase.getSchedules_ByTeamId(teamId);

            res.status(200).json({
                success: true,
                data: schedules,
                count: schedules.length
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }

    /**
     * GET /api/schedules/:id/can-delete
     * Vérifie si un schedule peut être supprimé
     * Admin uniquement
     */
    async canDeleteSchedule(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const result = await this.scheduleUseCase.canDeleteSchedule(id);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }
    // #endregion

    // #region POST Routes
    /**
     * POST /api/schedules
     * Crée un nouveau schedule
     * Admin uniquement
     */
    async createSchedule(req: Request, res: Response): Promise<void> {
        try {
            const dto: ScheduleCreateDTO = req.body;

            const schedule = await this.scheduleUseCase.createSchedule(dto);

            res.status(201).json({
                success: true,
                data: schedule,
                message: 'Schedule créé avec succès'
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }
    // #endregion

    // #region PATCH Routes
    /**
     * PATCH /api/schedules/:id
     * Met à jour un schedule existant
     * Admin uniquement
     */
    async updateSchedule_ById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            const dto: ScheduleUpdateDTO = req.body;

            const schedule = await this.scheduleUseCase.updateSchedule_ById(id, dto);

            res.status(200).json({
                success: true,
                data: schedule,
                message: 'Schedule mis à jour avec succès'
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }
    // #endregion

    // #region DELETE Routes
    /**
     * DELETE /api/schedules/:id
     * Supprime un schedule
     * Admin uniquement
     */
    async deleteSchedule_ById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(400).json({
                    success: false,
                    message: 'ID invalide'
                });
                return;
            }

            await this.scheduleUseCase.deleteSchedule_ById(id);

            res.status(200).json({
                success: true,
                message: 'Schedule supprimé avec succès'
            });
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error instanceof ForbiddenError) {
                res.status(403).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur interne du serveur'
                });
            }
        }
    }
    // #endregion
}

