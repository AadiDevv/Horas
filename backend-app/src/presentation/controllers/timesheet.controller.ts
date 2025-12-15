import { Request, Response } from 'express';
import { TimesheetUseCase } from '@/application/usecases';
import { TimesheetFilterDTO, TimesheetUpdateDTO, TimesheetReadDTO, TimesheetListItemDTO, TimesheetStatsDTO } from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { Timesheet } from '@/domain/entities/timesheet';

/**
 * Contrôleur pour la gestion des pointages (timesheets)
 */
export class TimesheetController {
    constructor(private UC_timesheet: TimesheetUseCase) {}

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
        
        const userId = req.user!.id;
        const userRole = req.user!.role;
        const timesheets = await this.UC_timesheet.getTimesheets(userRole, userId, filter);
        const dto: TimesheetListItemDTO[] = timesheets.map(t => t.toListItemDTO());

        res.success(dto, "Pointages récupérés avec succès");
    }

    /**
     * GET /api/timesheets/:id
     * Récupère un timesheet par ID
     */
    async getTimesheetById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const userId = req.user!.id;
        const userRole = req.user!.role;
        const timesheet = await this.UC_timesheet.getTimesheetById(id, userRole, userId);
        const dto: TimesheetReadDTO = timesheet.toReadDTO();

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
        const userId = req.user!.id;
        const userRole = req.user!.role;

        if (isNaN(employeId) || !startDate || !endDate) {
            throw new ValidationError("employeId, startDate et endDate sont requis");
        }

        const stats: TimesheetStatsDTO = await this.UC_timesheet.getTimesheetStats(employeId, startDate, endDate, userRole, userId);
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
        const userRole = req.user!.role;
        const userId = req.user!.id;
        const { timestamp, status, clockin: requestedClockin, employeId: requestedEmployeId } = req.body;

        // Déterminer l'employé cible
        let employeId: number;
        if ((userRole === 'manager' || userRole === 'admin') && requestedEmployeId) {
            employeId = Number(requestedEmployeId);
        } else {
            employeId = userId;
        }

        // Validation du timestamp (utiliser timestamp ou maintenant par défaut)
        const timestampDate = timestamp ? new Date(timestamp) : new Date();
        if (isNaN(timestampDate.getTime())) {
            throw new ValidationError("Le champ 'timestamp' doit être une date valide");
        }

        // Déterminer le sens du pointage
        let clockin: boolean;

        if ((userRole === 'manager' || userRole === 'admin') && requestedClockin !== undefined) {
            // Manager/Admin peut spécifier explicitement clockin
            clockin = Boolean(requestedClockin);
        } else {
            // Employee: auto-déterminer selon le dernier timesheet
            const lastTimesheet = await this.UC_timesheet.getLastTimesheetByEmployee(employeId);

            if (!lastTimesheet) {
                clockin = true;
            } else {
                clockin = !lastTimesheet.clockin;
            }
        }

        // Créer l'entité Timesheet
        const timesheet = new Timesheet({
            timestamp: timestampDate,
            clockin,
            status: status ?? 'normal',
            employeId,
        });

        const savedTimesheet = await this.UC_timesheet.createTimesheet(timesheet);
        const dto = savedTimesheet.toReadDTO();

        res.success(dto, `Pointage ${clockin ? 'entrée' : 'sortie'} enregistré avec succès`);
    }

    // #endregion

    // #region Update

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

        // Convertir timestamp si fourni
        if (dto.timestamp) {
            dto.timestamp = new Date(dto.timestamp);
        }

        const updated = await this.UC_timesheet.updateTimesheet(id, dto);
        const updatedDTO = updated.toReadDTO();

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

        await this.UC_timesheet.deleteTimesheet(id);

        res.success(null, "Pointage supprimé avec succès");
    }

    // #endregion
}
