import { Team, Team_Core, Team_L1 } from "@/domain/entities/team";
import { TeamCreateDTO, TeamUpdateDTO } from "@/application/DTOS/team.dto";

export namespace TeamMapper {

    export class FromDTO {

        /**
         * Crée une entité Team_Core à partir d'un DTO de création
         * Utilisé lors de la création d'une nouvelle équipe
         */
        public static Create_ToEntityCore(dto: TeamCreateDTO): Team_Core {
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
        public static Update_ToEntity(existing: Team, dto: TeamUpdateDTO): Team_L1 {
            return new Team_L1({
                ...existing,
                name: dto.name ?? existing.name,
                description: dto.description !== undefined ? dto.description : existing.description,
                scheduleId: dto.scheduleId !== undefined ? dto.scheduleId : existing.scheduleId,
                managerId: dto.managerId ?? existing.managerId,
                updatedAt: new Date(),
            });
        }
    }
}
