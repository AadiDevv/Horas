import { Schedule, Schedule_Core } from "@/domain/entities/schedule";
import { ScheduleReadDTO, ScheduleWithUsersDTO } from "@/application/DTOS/schedule.dto";
import { TeamMapper } from "@/application/mappers/team";
import { UserMapper } from "@/application/mappers/user";
import { UserEmployee_Core } from "@/domain/entities";
import { UserReadEmployeeDTO_Core } from "@/application/DTOS";

export namespace ScheduleMapper {

    export class FromEntity {

        /**
         * Convertit une entité Schedule en ScheduleReadDTO (détail complet avec relations)
         * Utilisé pour GET /schedules/:id avec includes
         */
        public static toReadDTO(schedule: Schedule): ScheduleReadDTO {
            return {
                ...schedule,
                startHour: Schedule_Core.formatTimeToString(schedule.startHour),
                endHour: Schedule_Core.formatTimeToString(schedule.endHour),
                createdAt: schedule.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                updatedAt: schedule.updatedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                usersCount: schedule.usersCount,
                teams: schedule.teams.map(t => TeamMapper.FromEntityCore.toReadDTO_Core(t)),
                manager: UserMapper.FromEntityCore.toReadDTO_Core(schedule.manager) ,
            };
        }

        /**
         * Convertit une entité Schedule en ScheduleWithUsersDTO (avec liste des utilisateurs)
         * Utilisé pour GET /schedules/:id?include=users
         */
        public static toWithUsersDTO(schedule: Schedule, users: UserEmployee_Core[]): ScheduleWithUsersDTO {
            return {
                ...this.toReadDTO(schedule),
                users: users.map(u => UserMapper.FromEntityCore.toReadDTO_Core(u)) as UserReadEmployeeDTO_Core[],
            };
        }
    }
}
