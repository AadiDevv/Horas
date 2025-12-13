import { Timesheet_Core } from "@/domain/entities/timesheet";
import { TimesheetReadDTO_Core } from "@/application/DTOS";

export namespace TimesheetMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Timesheet_Core en TimesheetReadDTO_Core
         * Utilisé après création ou pour listes
         */
        public static toReadDTO_Core(timesheet: Timesheet_Core): TimesheetReadDTO_Core {
            return {
                ...timesheet,
                timestamp: timesheet.timestamp.toISOString(),
            };
        }
    }
}
