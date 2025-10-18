import { TeamCreateDTO, TeamUpdateDTO, TeamFilterDTO, TeamWithMembersDTO } from "@/application/DTOS";
import { Team } from "@/domain/entities/team";
import { ITeam } from "@/domain/interfaces/team.interface";
import { NotFoundError, ValidationError, ForbiddenError } from "@/domain/error/AppError";

/**
 * Use Case pour la gestion des équipes
 * Contient la logique métier et les règles de gestion
 */
export class TeamUseCase {

    constructor(private readonly R_team: ITeam) { }

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
    async getTeams(userRole: string, userId: number, filter?: TeamFilterDTO): Promise<Team[]> {
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
        const teams = await this.R_team.getTeams_ByManagerId(managerId);
        const teamEntities: Team[] = teams.map(team => new Team({ ...team }));
        return teamEntities;
        // #endregion
    }

    /**
     * Récupère une équipe par son ID
     * Le repository charge automatiquement le manager et les members via includes
     * 
     * @param id - ID de l'équipe
     * @returns L'équipe avec ses relations chargées
     * @throws NotFoundError si l'équipe n'existe pas
     */
    async getTeam_ById(id: number): Promise<Team> {
        const team = await this.R_team.getTeam_ById(id);
        if (!team) {
            throw new NotFoundError(`Équipe avec l'ID ${id} introuvable`);
        }

        return team;
    }
    // #endregion

    // #region Create
    /**
     * Crée une nouvelle équipe
     * Le managerId est fourni dans le DTO (récupéré du JWT dans le contrôleur)
     * 
     * Logique métier :
     * - Validation des données via l'entité
     * - Création de l'équipe dans le repository
     * 
     * @param dto - Données de création
     * @returns L'équipe créée
     * @throws ValidationError si les données sont invalides
     */
    async createTeam(dto: TeamCreateDTO, userId: number): Promise<Team> {
        console.log("managerId from dto : ", dto.managerId);
        console.log("userId from jwt : ", userId);
        if (dto.managerId !== userId) {
            throw new ValidationError("Le managerId passé dans le DTO doit être le même que celui del'utilisateur connecté");
        }
        // Création de l'entité depuis le DTO
        const team = Team.fromCreateDTO(dto);
        // Sauvegarde dans le repository
        const teamCreated = await this.R_team.createTeam(team);

        return teamCreated;
    }
    // #endregion

    // #region Update
    /**
     * Met à jour une équipe existante
     * 
     * Règles métier :
     * - Le managerId ne peut PAS être modifié (une équipe reste liée à son manager)
     * - Seuls lastName, description et scheduleId peuvent être modifiés
     * 
     * @param id - ID de l'équipe à modifier
     * @param dto - Données de mise à jour
     * @returns L'équipe mise à jour
     * @throws NotFoundError si l'équipe n'existe pas
     * @throws ValidationError si tentative de modification du managerId
     */
    async updateTeam(id: number, dto: TeamUpdateDTO, userId: number): Promise<Team> {
        // Vérification : interdiction de changer le manager

        // Récupération de l'équipe existante
        const existingTeam = await this.getTeam_ById(id);

        const teamManagerId = existingTeam?.managerId;

        if (teamManagerId !== userId) {
            console.log("dto.managerId : ", teamManagerId);
            console.log("userId : ", userId);
            throw new ValidationError("Le managerId passé dans le DTO doit être le même que celui del'utilisateur connecté");
        }

        // Mise à jour via la factory method
        const updatedTeam = Team.fromUpdateDTO(existingTeam, dto);

        // Validation métier
        updatedTeam.validate();

        // Sauvegarde via le repository
        const teamUpdated = await this.R_team.updateTeam_ById(updatedTeam);

        return teamUpdated;
    }
    // #endregion

    // #region Delete
    /**
     * Suppression logique (soft delete) d'une équipe
     * 
     * Règles métier :
     * - Une équipe contenant des members ne peut PAS être supprimée
     * - Les members doivent d'abord être déplacés vers une autre équipe
     * 
     * @param id - ID de l'équipe à supprimer
     * @throws NotFoundError si l'équipe n'existe pas
     * @throws ValidationError si l'équipe contient des members
     */
    async deleteTeam(id: number, userId: number): Promise<void> {
        // Récupération de l'équipe avec ses members (chargés par le repository)
        const team = await this.getTeam_ById(id);
        if (team.managerId !== userId) {
            throw new ValidationError("Le managerId passé dans le DTO doit être le même que celui del'utilisateur connecté");
        }

        // Vérification : l'équipe ne doit pas contenir de members
        const membersCount = team.members?.length ?? 0;
        if (membersCount > 0) {
            throw new ValidationError(
                `L'équipe "${team.name}" contient ${membersCount} membre(s). ` +
                `Veuillez d'abord déplacer ou retirer les members avant de supprimer l'équipe.`
            );
        }

        // Suppression logique via le repository
        await this.R_team.deleteTeam_ById(id);
    }
    // #endregion
}

