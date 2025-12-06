import { Timesheet_L1 } from "@/domain/entities/timesheet";
import { TimesheetReadDTO_L1 } from "@/application/DTOS";

export namespace TimesheetMapper {

    export class FromEntityL1 {

        /**
         * Convertit une entité Timesheet_L1 en TimesheetReadDTO_L1 (sans employe)
         * Utilisé pour GET /timesheets/:id sans includes
         */
        public static toReadDTO_L1(timesheet: Timesheet_L1): TimesheetReadDTO_L1 {
            return {
                ...timesheet,
                date: timesheet.date.toISOString().split("T")[0],
                hour: timesheet.hour.toISOString(),
                createdAt: timesheet.createdAt.toISOString(),
                updatedAt: timesheet.updatedAt.toISOString(),
            };
        }
    }
}
