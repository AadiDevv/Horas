import { EquipeCreateDTO, EquipeUpdateDTO, EquipeFilterDTO } from "@/application/DTOS";
import { Equipe } from "@/domain/entities/equipe";
import { IEquipe } from "@/domain/interfaces/equipe.interface";
import { AlreadyExistsError, NotFoundError, ValidationError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des équipes
 * Contient la logique métier et les règles de gestion
 */
export class EquipeUseCase {

    constructor(private readonly R_equipe: IEquipe) { }

    // #region Read
    /**
     * Récupère les équipes selon le rôle de l'utilisateur
     * 
     * Logique métier :
     * - Manager : retourne SES équipes (managerId déduit ou vérifié)
     * - Admin : retourne toutes les équipes OU filtre par managerId
     * - Employé : accès refusé
     * 
     * @param userRole - Rôle de l'utilisateur connecté (depuis JWT)
     * @param userId - ID de l'utilisateur connecté (depuis JWT)
     * @param filter - Filtres optionnels (managerId)
     */
    async getEquipes(userRole: string, userId: number, filter?: EquipeFilterDTO): Promise<Equipe[]> {
        // TODO: Implémenter la logique de filtrage selon le rôle
        // 1. Si employe → throw new ValidationError('Les employés ne peuvent pas accéder aux équipes')
        // 2. Si manager :
        //    - Si filter.managerId fourni ET !== userId → throw new ValidationError('Vous ne pouvez consulter que vos propres équipes')
        //    - Sinon → retourner R_equipe.getEquipes_ByManagerId(userId)
        // 3. Si admin :
        //    - Si filter.managerId fourni → retourner R_equipe.getEquipes_ByManagerId(filter.managerId)
        //    - Sinon → retourner R_equipe.getAllEquipes()
        throw new Error("Method not implemented.");
    }

    async getEquipe_ById(id: number): Promise<Equipe> {
        // TODO: Implémenter la récupération d'une équipe par ID
        // 1. Appeler R_equipe.getEquipe_ById(id)
        // 2. Si null → throw new NotFoundError('Équipe non trouvée')
        // 3. Retourner l'équipe
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Create
    async createEquipe(dto: EquipeCreateDTO): Promise<Equipe> {
        // TODO: Implémenter la création d'une équipe
        // 1. Valider les données (nom non vide, managerId valide, etc.)
        // 2. Créer l'entité Equipe
        // 3. Appeler R_equipe.createEquipe(equipe)
        // 4. Retourner l'équipe créée
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Update
    async updateEquipe(id: number, dto: EquipeUpdateDTO): Promise<Equipe> {
        // TODO: Implémenter la mise à jour d'une équipe
        // 1. Vérifier que l'équipe existe
        // 2. Mettre à jour les champs fournis
        // 3. Appeler R_equipe.updateEquipe_ById(equipe)
        // 4. Retourner l'équipe mise à jour
        throw new Error("Method not implemented.");
    }
    // #endregion

    // #region Delete
    async deleteEquipe(id: number): Promise<void> {
        // TODO: Implémenter la suppression d'une équipe
        // 1. Vérifier que l'équipe existe
        // 2. Vérifier qu'elle n'a pas de membres (logique métier à décider)
        // 3. Appeler R_equipe.deleteEquipe_ById(id)
        throw new Error("Method not implemented.");
    }
    // #endregion
}

