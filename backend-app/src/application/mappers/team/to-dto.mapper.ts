import { Team } from "@/domain/entities/team";
import { TeamReadDTO, TeamWithMembersDTO } from "@/application/DTOS/team.dto";
import { UserMapper } from "@/application/mappers/user";
import { ScheduleMapper } from "@/application/mappers/schedule";
import { UserReadEmployeeDTO_Core, UserReadManagerDTO_Core } from "@/application/DTOS";

export namespace TeamMapper {

    export class FromEntity {

        /**
         * Convertit une entité Team en TeamReadDTO (détail complet avec relations)
         * Utilisé pour GET /teams/:id
         */
        public static toReadDTO(team: Team): TeamReadDTO {
            return {
                ...team,
                createdAt: team.createdAt.toISOString(),
                updatedAt: team.updatedAt.toISOString(),
                deletedAt: team.deletedAt ? team.deletedAt.toISOString() : null,
                manager: UserMapper.FromEntityCore.toReadDTO_Core(team.manager) as UserReadManagerDTO_Core,
                schedule: team.schedule ? ScheduleMapper.FromEntityCore.toReadDTO_Core(team.schedule) : null,
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
                members: team.members?.map(m => UserMapper.FromEntityCore.toReadDTO_Core(m)) as UserReadEmployeeDTO_Core[] ?? [] as UserReadEmployeeDTO_Core[],
            };
        }
    }
}
