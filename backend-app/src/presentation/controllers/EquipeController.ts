import { Request, Response } from 'express';
import { EquipeUseCase } from '@/application/usecases';
import { EquipeCreateDTO, EquipeUpdateDTO, EquipeReadDTO, EquipeListItemDTO } from '@/application/DTOS';
import { ValidationError } from '@/domain/error/AppError';
import { Equipe } from '@/domain/entities/equipe';

/**
 * Contrôleur pour la gestion des équipes
 * Gère les requêtes HTTP et appelle les use cases appropriés
 */
export class EquipeController {
    constructor(private UC_equipe: EquipeUseCase) { }

    // #region Helper - Conversion Entité → DTO
    
     //Convertit les dates en ISO string
    private toDateStrings(equipe: { createdAt: Date; updatedAt?: Date; deletedAt?: Date | null }) {
        return {
            createdAt: equipe.createdAt.toISOString(),
            updatedAt: equipe.updatedAt ? equipe.updatedAt.toISOString() : null,
            deletedAt: equipe.deletedAt ? equipe.deletedAt.toISOString() : null
        };
    }

    //Convertit une Entité Equipe en EquipeReadDTO (détail complet)
    //Utilise le spread operator pour copier les propriétés
    private toEquipeDTO(equipe: Equipe): EquipeReadDTO {
        if (!equipe.id) throw new ValidationError("No equipe id");

        const { createdAt, updatedAt, deletedAt, ...rest } = equipe;

        const equipeResponse: EquipeReadDTO = {
            ...rest,
            id: equipe.id,
            ...this.toDateStrings(equipe)
        };

        return equipeResponse;
    }

    //Convertit une Entité Equipe en EquipeListItemDTO (version liste simplifiée)
     //TODO: Enrichir avec managerNom et membresCount depuis le UseCase
    private toEquipeListItemDTO(equipe: Equipe, managerNom: string, membresCount: number) {
        if (!equipe.id) throw new ValidationError("No equipe id");

        return {
            id: equipe.id,
            nom: equipe.nom,
            description: equipe.description ?? null,
            managerId: equipe.managerId,
            managerNom,
            membresCount,
            createdAt: equipe.createdAt.toISOString()
        };
    }
    // #endregion

    // #region Read
    /**
     * GET /api/equipes?managerId=X
     * Récupère les équipes selon le rôle et les filtres
     * Retourne une liste simplifiée (EquipeListItemDTO[])
     */
    async getEquipes(req: Request, res: Response): Promise<void> {
        // #region - Extraction des données
        let managerId: number | undefined;
        const userRole = req.user!.role;
        const userId = req.user!.id;

        // Si managerId fourni en query param
        if (req.query.managerId) {
            managerId = Number(req.query.managerId);
        }
        // #endregion

        // #region - Logique selon le rôle
        const equipes = await this.UC_equipe.getEquipes(userRole, userId, { managerId });
        // #endregion

        // #region - Conversion en DTO (EquipeListItemDTO)
        // TODO: Le UseCase devrait retourner les données enrichies (managerNom, membresCount)
        // Pour l'instant, on utilise des valeurs temporaires
        const equipesDTO = equipes.map(equipe =>
            this.toEquipeListItemDTO(
                equipe,
                'TODO: Manager Name',  // TODO: Récupérer depuis le UseCase
                0                       // TODO: Récupérer depuis le UseCase
            )
        );
        // #endregion

        res.success(equipesDTO, "Équipes récupérées avec succès");
    }

    async getEquipe_ById(req: Request, res: Response): Promise<void> {
        // #region - Validation
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");
        // #endregion

        const equipe = await this.UC_equipe.getEquipe_ById(id);

        // #region - Conversion en DTO
        const equipeDTO = this.toEquipeDTO(equipe);
        // #endregion

        res.success(equipeDTO, "Équipe récupérée avec succès");
    }
    // #endregion

    // #region Create
    async createEquipe(req: Request, res: Response): Promise<void> {
        // #region - Validation
        const equipeDto: EquipeCreateDTO = req.body;
        if (!equipeDto.nom) throw new ValidationError("Le nom de l'équipe est requis");
        if (!equipeDto.managerId) throw new ValidationError("Le managerId est requis");
        // #endregion

        const equipe = await this.UC_equipe.createEquipe(equipeDto);

        // #region - Conversion en DTO
        const equipeDTO = this.toEquipeDTO(equipe);
        // #endregion

        res.success(equipeDTO, "Équipe créée avec succès");
    }
    // #endregion

    // #region Update
    async updateEquipe(req: Request, res: Response): Promise<void> {
        // #region - Validation
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");

        const equipeDto: EquipeUpdateDTO = req.body;
        if (!equipeDto || Object.keys(equipeDto).length === 0) {
            throw new ValidationError("Aucune donnée à mettre à jour");
        }
        // #endregion

        const equipe = await this.UC_equipe.updateEquipe(id, equipeDto);

        // #region - Conversion en DTO
        const equipeDTO = this.toEquipeDTO(equipe);
        // #endregion

        res.success(equipeDTO, "Équipe modifiée avec succès");
    }
    // #endregion

    // #region Delete
    async deleteEquipe(req: Request, res: Response): Promise<void> {
        // #region - Validation
        const id = Number(req.params.id);
        if (isNaN(id)) throw new ValidationError("ID invalide");
        // #endregion

        await this.UC_equipe.deleteEquipe(id);

        res.success(null, "Équipe supprimée avec succès");
    }
    // #endregion
}

