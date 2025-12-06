import { Schedule_Core } from "@/domain/entities/schedule";
import { ScheduleReadDTO_Core } from "@/application/DTOS/schedule.dto";

export namespace ScheduleMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Schedule_Core en ScheduleReadDTO_Core (champs métier uniquement)
         * Utilisé après création ou pour relations
         */
        public static toReadDTO_Core(schedule: Schedule_Core): ScheduleReadDTO_Core {
            return {
                ...schedule,
                ...schedule.hoursToISOString()
            };
        }

    }
}
