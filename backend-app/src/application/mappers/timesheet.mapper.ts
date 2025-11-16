import { Timesheet } from "@/domain/entities/timesheet";
import { TimesheetReadDTO, TimesheetListItemDTO, TimesheetUpdateDTO } from "@/application/DTOS";
import { UserMapper } from "./user.mapper";

/**
 * Mapper pour convertir les entités Timesheet en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */
export class TimesheetMapper {
    /**
     * Convertit une entité Timesheet en TimesheetReadDTO (détail complet)
     * Utilisé pour GET /timesheets/:id
     */
    public static toReadDTO(timesheet: Timesheet): TimesheetReadDTO {
        return {
            ...timesheet,
            date: timesheet.date.toISOString().split("T")[0], // YYYY-MM-DD
            hour: timesheet.hour.toISOString(),
            createdAt: timesheet.createdAt.toISOString(),
            updatedAt: timesheet.updatedAt.toISOString(),
            employe: UserMapper.toReadEmployeeCoreDTO(timesheet.employe) /// emplouee toReadDTO
        };
    }

    /**
     * Convertit une entité Timesheet en TimesheetListItemDTO (liste simplifiée)
     * Utilisé pour GET /timesheets (liste)
     */
    public static toListItemDTO(timesheets: Timesheet[]): TimesheetListItemDTO[] {
        return timesheets.map(timesheet => ({
            ...timesheet,
            date: timesheet.date.toISOString().split("T")[0],
            hour: timesheet.hour.toISOString(),

        }));
    }

    /**
     * Met à jour une entité Timesheet existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     * Utilisé pour PATCH /timesheets/:id
     */
    public static fromUpdateDTO(existing: Timesheet, dto: TimesheetUpdateDTO): Timesheet {
        return new Timesheet({
            ...existing,
            date: dto.date ? new Date(dto.date) : existing.date,
            hour: dto.hour ? new Date(dto.hour) : existing.hour,
            clockin: dto.clockin ?? existing.clockin,
            status: dto.status ?? existing.status,
            updatedAt: new Date(Date.now()),
        });
    }
}
