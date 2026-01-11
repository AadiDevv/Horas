import { Schedule_L1, Schedule_Core } from "@/domain/entities/schedule";
import { ScheduleReadDTO_L1 } from "@/application/DTOS/schedule.dto";

export namespace ScheduleMapper {

    export class FromEntityL1 {

        /**
         * Convertit une entité Schedule_L1 en ScheduleReadDTO_L1 (sans relations)
         * Utilisé pour GET /schedules/:id sans includes
         * Note: usersCount doit être calculé en amont et passé en paramètre
         */
        public static toReadDTO_L1(schedule: Schedule_L1): ScheduleReadDTO_L1 {
            return {
                ...schedule,
                startHour: Schedule_Core.formatTimeToString(schedule.startHour),
                endHour: Schedule_Core.formatTimeToString(schedule.endHour),
                createdAt: schedule.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
                updatedAt: schedule.updatedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            };
        }
    }
}
