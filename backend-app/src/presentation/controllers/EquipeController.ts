import { Request, Response } from 'express';
import { EquipeUseCase } from '@/application/usecases';
import { EquipeCreateDTO, EquipeUpdateDTO, EquipeWithMembresDTO } from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';

/**
 * Contrôleur pour la gestion des équipes
 * Gère les requêtes HTTP et appelle les use cases appropriés
 * 
 * Note: Les transformations Entité ↔ DTO sont désormais gérées par l'entité Equipe elle-même
 */
export class EquipeController {
    constructor(private UC_equipe: EquipeUseCase) { }

    // #region Read
    /**
     * GET /api/equipes?managerId=X
     * Récupère les équipes selon le rôle et les filtres
     * Retourne une liste simplifiée (EquipeListItemDTO[])
     */
    async getEquipes(req: Request, res: Response): Promise<void> {
        const userRole = req.user!.role;
        const userId = req.user!.id;
        const managerId = req.query.managerId ? Number(req.query.managerId) : undefined;

        const equipes = await this.UC_equipe.getEquipes(userRole, userId, { managerId });
        const equipesDTO = equipes.map(equipe => equipe.toListItemDTO());

        res.success(equipesDTO, "Équipes récupérées avec succès");
    }

    async getEquipe_ById(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const equipe = await this.UC_equipe.getEquipe_ById(id);
        const equipeWithMembres: EquipeWithMembresDTO = equipe?.toWithMembresDTO();

        res.success(equipeWithMembres, "Équipe récupérée avec succès");
    }
    // #endregion

    // #region Create
    async createEquipe(req: Request, res: Response): Promise<void> {
        const equipeDto: EquipeCreateDTO = req.body;
        const userId = req.user!.id;
        if (!equipeDto.lastName) throw new ValidationError("Le lastName de l'équipe est requis");
        if (!equipeDto.managerId) throw new ValidationError("Le managerId est requis");

        const equipe = await this.UC_equipe.createEquipe(equipeDto, userId);
        const equipeDTO = equipe.toReadDTO();

        res.success(equipeDTO, "Équipe créée avec succès");
    }
    // #endregion

    // #region Update
    async updateEquipe(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const equipeDto: EquipeUpdateDTO = req.body;
        if (!equipeDto || Object.keys(equipeDto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }

        const equipe = await this.UC_equipe.updateEquipe(id, equipeDto, req.user!.id);
        const equipeDTO = equipe.toReadDTO();

        res.success(equipeDTO, "Équipe modifiée avec succès");
    }
    // #endregion

    // #region Delete
    async deleteEquipe(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        await this.UC_equipe.deleteEquipe(id, req.user!.id);

        res.success(null, "Équipe supprimée avec succès");
    }
    // #endregion
}

