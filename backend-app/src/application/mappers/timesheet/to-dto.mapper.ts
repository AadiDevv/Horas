import { Timesheet } from "@/domain/entities/timesheet";
import { TimesheetReadDTO, UserReadEmployeeDTO_Core } from "@/application/DTOS";
import { UserMapper } from "@/application/mappers/user";

export namespace TimesheetMapper {

    export class FromEntity {

        /**
         * Convertit une entité Timesheet en TimesheetReadDTO (détail complet avec employe)
         * Utilisé pour GET /timesheets/:id
         */
        public static toReadDTO(timesheet: Timesheet): TimesheetReadDTO {
            return {
                ...timesheet,
                timestamp: timesheet.timestamp.toISOString(),
                createdAt: timesheet.createdAt.toISOString(),
                updatedAt: timesheet.updatedAt.toISOString(),
                employe: UserMapper.FromEntityCore.toReadDTO_Core(timesheet.employe) as UserReadEmployeeDTO_Core,
            };
        }
    }
}
