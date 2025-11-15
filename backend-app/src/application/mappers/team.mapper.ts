import { Team, Team_Core } from "@/domain/entities/team";
import {
    TeamReadDTO,
    TeamListItemDTO,
    TeamWithMembersDTO,
    TeamCreateDTO,
    TeamUpdateDTO,
    TeamManagerDTO,
    TeamMembreDTO
} from "@/application/DTOS/team.dto";

/**
 * Mapper pour convertir les entités Team en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */
export class TeamMapper {
    // #region Transformation Entité → DTO

    /**
     * Convertit une entité Team en TeamReadDTO (détail complet)
     * Utilisé pour GET /teams/:id
     */
    public static toReadDTO(team: Team): TeamReadDTO {
        return {
            ...team,
            createdAt: team.createdAt.toISOString(),
            updatedAt: team.updatedAt.toISOString(),
            deletedAt: team.deletedAt?.toISOString(),
            manager: team.manager ? {
                ...team.manager,
            } as TeamManagerDTO : undefined,
            membersCount: team.members?.length ?? team.membersCount ?? 0,
        };
    }

    /**
     * Convertit une entité Team en TeamListItemDTO (liste simplifiée)
     * Utilisé pour GET /teams (liste)
     */
    public static toListItemDTO(team: Team): TeamListItemDTO {
        return {
            ...team,
            createdAt: team.createdAt.toISOString(),
            deletedAt: team.deletedAt?.toISOString(),
            managerlastName: team.manager
                ? `${team.manager.firstName} ${team.manager.lastName}`
                : "Manager inconnu",
            membersCount: team.members?.length ?? team.membersCount ?? 0,
        };
    }

    /**
     * Convertit une entité Team en TeamWithMembersDTO (avec liste des membres)
     * Utilisé pour GET /teams/:id?include=members
     */
    public static toWithMembersDTO(team: Team): TeamWithMembersDTO {
        return {
            ...this.toReadDTO(team),
            members: team.members?.map(member => ({
                ...member,
            } as TeamMembreDTO)) ?? [],
        };
    }
    // #endregion

    // #region Transformation DTO → Entité (Factory)

    /**
     * Crée une entité Team_Core à partir d'un DTO de création
     * Utilisé lors de la création d'une nouvelle équipe
     */
    public static fromCreateDTO(dto: TeamCreateDTO): Team_Core {
        return new Team_Core({
            ...dto,
            id: 0, // Sera généré par Prisma
            description: dto.description ?? null,
            scheduleId: dto.scheduleId ?? null,
            membersCount: 0,
        });
    }

    /**
     * Met à jour une entité Team existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public static fromUpdateDTO(existing: Team, dto: TeamUpdateDTO): Team {
        return new Team({
            ...existing,
            name: dto.name ?? existing.name,
            description: dto.description !== undefined ? dto.description : existing.description,
            scheduleId: dto.scheduleId !== undefined ? dto.scheduleId : existing.scheduleId,
            managerId: dto.managerId ?? existing.managerId,
            updatedAt: new Date(),
        });
    }
    // #endregion
}
