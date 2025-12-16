import { Request, Response } from 'express';
import { TeamUseCase } from '@/application/usecases';
import { TeamCreateDTO, TeamUpdateDTO, TeamAsignScheduleDTO, TeamReadDTO } from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { TeamMapper } from '@/application/mappers/team';
import { Team_L1 } from '@/domain/entities/team';

/**
 * Contrôleur pour la gestion des équipes
 * Gère les requêtes HTTP et appelle les use cases appropriés
 * 
 * Note: Les transformations Entité ↔ DTO sont désormais gérées par l'entité Team elle-même
 */
export class TeamController {
    constructor(private UC_team: TeamUseCase) { }

    // #region Read
    /**
     * GET /api/teams?managerId=X
     * Récupère les équipes selon le rôle et les filtres
     * Retourne une liste simplifiée (TeamListItemDTO[])
     */
    async getTeams(req: Request, res: Response): Promise<void> {
        const userRole = req.user!.role;
        const userId = req.user!.id;
        const managerId = (req.query.managerId && req.query.managerId !== "0") ? Number(req.query.managerId) : undefined;
        
        const teams: Team_L1[] = await this.UC_team.getTeams(userRole, userId, { managerId });
        const teamsDTO = teams.map(team => TeamMapper.FromEntityL1.toReadDTO_L1(team));

        res.success(teamsDTO, "Équipes récupérées avec succès");
    }

    async getTeam_ById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const team = await this.UC_team.getTeam_ById(id);
        const teamWithMembers: TeamReadDTO = TeamMapper.FromEntity.toReadDTO(team);

        res.success(teamWithMembers, "Équipe récupérée avec succès");
    }
    // #endregion

    // #region Create
    async createTeam(req: Request, res: Response): Promise<void> {
        const teamDto: TeamCreateDTO = { ...req.body, managerId: req.user!.id };
        const userId = req.user!.id;
        if (!teamDto.name) throw new ValidationError("Le lastName de l'équipe est requis");
        if (!teamDto.managerId) throw new ValidationError("Le managerId est requis");

        const team = await this.UC_team.createTeam(teamDto, userId);
        const teamDTO = TeamMapper.FromEntityCore.toReadDTO_Core(team);

        res.success(teamDTO, "Équipe créée avec succès");
    }
    // #endregion

    // #region Update
    async updateTeam(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const teamDto: TeamUpdateDTO = req.body;
        if (!teamDto || Object.keys(teamDto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }

        const team = await this.UC_team.updateTeam(id, teamDto, req.user!.id);
        const teamDTO = TeamMapper.FromEntityCore.toReadDTO_Core(team);

        res.success(teamDTO, "Équipe modifiée avec succès");
    }
    async updateTeamSchedule_ById(req: Request, res: Response): Promise<void> {
        const teamId = Number(req.params.id);
        if (isNaN(teamId)) throw new ValidationError("ID schedule invalide");

        const dto: TeamAsignScheduleDTO = req.body;
        if (!dto.scheduleId) throw new ValidationError("Le scheduleId est requis");


        const team = await this.UC_team.updateTeamSchedule_ById(teamId, dto.scheduleId, req.user!);
        const teamDTO = TeamMapper.FromEntityCore.toReadDTO_Core(team);

        res.success(teamDTO, "Équipe assignée à l'équipe avec succès");
    }
    // #endregion

    // #region Delete
    async deleteTeam(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        await this.UC_team.deleteTeam(id, req.user!.id);

        res.success(null, "Équipe supprimée avec succès");
    }
    // #endregion
}

