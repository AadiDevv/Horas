import { Timesheet } from "@/domain/entities/timesheet";
import { TimesheetReadDTO, TimesheetListItemDTO, TimesheetUpdateDTO } from "@/application/DTOS";

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
            id: timesheet.id,
            employeId: timesheet.employeId,
            clockin: timesheet.clockin,
            status: timesheet.status,
            date: timesheet.date.toISOString().split("T")[0], // YYYY-MM-DD
            hour: timesheet.hour.toISOString(),
            createdAt: timesheet.createdAt.toISOString(),
            updatedAt: timesheet.updatedAt.toISOString(),
            employe: {
                id: timesheet.employe.id!,
                firstName: timesheet.employe.firstName,
                lastName: timesheet.employe.lastName,
                email: timesheet.employe.email
            },
        };
    }

    /**
     * Convertit une entité Timesheet en TimesheetListItemDTO (liste simplifiée)
     * Utilisé pour GET /timesheets (liste)
     */
    public static toListItemDTO(timesheet: Timesheet): TimesheetListItemDTO {
        return {
            id: timesheet.id,
            employeId: timesheet.employeId,
            employelastName: `${timesheet.employe.firstName} ${timesheet.employe.lastName}`,
            date: timesheet.date.toISOString().split("T")[0],
            hour: timesheet.hour.toISOString(),
            clockin: timesheet.clockin,
            status: timesheet.status,
        };
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
