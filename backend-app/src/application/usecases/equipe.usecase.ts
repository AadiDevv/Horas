import { EquipeCreateDTO, EquipeUpdateDTO, EquipeFilterDTO } from "@/application/DTOS";
import { Equipe } from "@/domain/entities/equipe";
import { IEquipe } from "@/domain/interfaces/equipe.interface";
import { AlreadyExistsError, NotFoundError, ValidationError, ForbiddenError } from "@/domain/error/AppError";

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
     * - Manager SANS managerId fourni → retourne SES équipes (userId utilisé)
     * - Manager AVEC managerId fourni → vérifie que c'est son ID, sinon 403
     * - Admin SANS managerId → erreur 400 (doit spécifier le managerId)
     * - Admin AVEC managerId → retourne les équipes du manager spécifié
     * - Employé → 403 (déjà géré par le middleware managerOrAdmin)
     * 
     * Résultat : on obtient toujours un managerId unique pour interroger le repository
     * 
     * @param userRole - Rôle de l'utilisateur connecté (depuis JWT)
     * @param userId - ID de l'utilisateur connecté (depuis JWT)
     * @param filter - Filtres optionnels (managerId)
     * @returns Liste des équipes du manager spécifié
     */
    async getEquipes(userRole: string, userId: number, filter?: EquipeFilterDTO): Promise<Equipe[]> {
        let managerId: number;

        // #region - Détermination du managerId selon le rôle et les filtres
        if (userRole === "manager") {
            // CAS MANAGER
            if (filter?.managerId) {
                // Manager a fourni un managerId → vérifier que c'est le sien
                if (filter.managerId !== userId) {
                    throw new ForbiddenError("Vous ne pouvez consulter que vos propres équipes");
                }
                managerId = userId;
            } else {
                // Manager n'a pas fourni de managerId → utiliser son propre ID
                managerId = userId;
            }
        }
        else if (userRole === "admin") {
            // CAS ADMIN
            if (!filter?.managerId) {
                // Admin doit obligatoirement spécifier le managerId
                throw new ValidationError("En tant qu'admin, vous devez spécifier le managerId dans les paramètres");
            }
            // Admin a fourni un managerId → l'utiliser
            managerId = filter.managerId;
        }
        else {
            // CAS AUTRE (employé ou rôle invalide)
            // Normalement impossible grâce au middleware managerOrAdmin
            throw new ForbiddenError(`Accès interdit pour le rôle ${userRole}`);
        }
        // #endregion

        // #region - Récupération des équipes via le repository
        // À ce stade, on a toujours un managerId défini
        const equipes = await this.R_equipe.getEquipes_ByManagerId(managerId);
        const equipeEntities : Equipe[] = equipes.map(equipe => new Equipe({...equipe}));
        return equipes;
        // #endregion
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

