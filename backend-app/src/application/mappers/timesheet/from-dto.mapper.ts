import { Timesheet, Timesheet_L1 } from "@/domain/entities/timesheet";
import { TimesheetUpdateDTO } from "@/application/DTOS";

export namespace TimesheetMapper {

    export class FromDTO {

        /**
         * Met à jour une entité Timesheet existante avec les données d'un DTO de mise à jour
         * Retourne une nouvelle instance (immutabilité)
         * Utilisé pour PATCH /timesheets/:id
         */
        public static Update_ToEntity(existing: Timesheet, dto: TimesheetUpdateDTO): Timesheet_L1 {
            return new Timesheet_L1({
                ...existing,
                date: dto.date ? new Date(dto.date) : existing.date,
                hour: dto.hour ? new Date(dto.hour) : existing.hour,
                clockin: dto.clockin ?? existing.clockin,
                status: dto.status ?? existing.status,
                updatedAt: new Date(Date.now()),
            });
        }
    }
}
