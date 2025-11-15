import { Schedule, Schedule_Core } from "@/domain/entities/schedule";
import {
    ScheduleReadDTO,
    ScheduleListItemDTO,
    ScheduleWithUsersDTO,
    ScheduleCreateDTO,
    ScheduleUpdateDTO
} from "@/application/DTOS/schedule.dto";

/**
 * Mapper pour convertir les entités Schedule en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */
export class ScheduleMapper {
    // #region Transformation Entité → DTO

    /**
     * Convertit une entité Schedule en ScheduleReadDTO (détail complet)
     * Utilisé pour GET /schedules/:id
     */
    public static toReadDTO(schedule: Schedule): ScheduleReadDTO {
        return {
            ...schedule,
            startHour: Schedule_Core.formatTimeToString(schedule.startHour),
            endHour: Schedule_Core.formatTimeToString(schedule.endHour),
            createdAt: schedule.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            updatedAt: schedule.updatedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            usersCount: schedule.usersCount,
        };
    }

    /**
     * Convertit une entité Schedule en ScheduleListItemDTO (liste simplifiée)
     * Utilisé pour GET /schedules (liste)
     */
    public static toListItemDTO(schedule: Schedule): ScheduleListItemDTO {
        return {
            ...schedule,
            startHour: Schedule_Core.formatTimeToString(schedule.startHour),
            endHour: Schedule_Core.formatTimeToString(schedule.endHour),
            usersCount: schedule.usersCount ?? 0,
        };
    }

    /**
     * Convertit une entité Schedule en ScheduleWithUsersDTO (avec liste des utilisateurs)
     * Utilisé pour GET /schedules/:id?include=users
     */
    public static toWithUsersDTO(schedule: Schedule): ScheduleWithUsersDTO {
        return {
            ...this.toReadDTO(schedule),
            users: schedule.users?.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            })) ?? [],
        };
    }
    // #endregion

    // #region Transformation DTO → Entité (Factory)

    /**
     * Crée une entité Schedule_Core à partir d'un DTO de création
     * Utilisé lors de la création d'un nouveau schedule
     */
    public static fromCreateDTO(dto: ScheduleCreateDTO, managerId: number): Schedule_Core {
        return new Schedule_Core({
            id: 0, // Sera généré par Prisma
            name: dto.name,
            startHour: Schedule_Core.parseTimeString(dto.startHour),
            endHour: Schedule_Core.parseTimeString(dto.endHour),
            activeDays: dto.activeDays,
            managerId: managerId,
            usersCount: 0,
        });
    }

    /**
     * Met à jour une entité Schedule existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public static fromUpdateDTO(existing: Schedule, dto: ScheduleUpdateDTO): Schedule {
        return new Schedule({
            ...existing,
            name: dto.name ?? existing.name,
            startHour: dto.startHour ? Schedule_Core.parseTimeString(dto.startHour) : existing.startHour,
            endHour: dto.endHour ? Schedule_Core.parseTimeString(dto.endHour) : existing.endHour,
            activeDays: dto.activeDays ?? existing.activeDays,
            updatedAt: new Date(),
        });
    }
    // #endregion
}
