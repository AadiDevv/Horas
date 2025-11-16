import { Schedule, Schedule_Core } from "@/domain/entities/schedule";
import {
    ScheduleReadDTO,
    ScheduleListItemDTO,
    ScheduleWithUsersDTO,
    ScheduleCreateDTO,
    ScheduleUpdateDTO,
    ScheduleCoreDTO
} from "@/application/DTOS/schedule.dto";
import { TeamMapper } from "./team.mapper";
import { UserMapper } from "./user.mapper";
import { UserEmployee_Core } from "@/domain/entities";

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
            teams: TeamMapper.toListItemDTO(schedule.teams),
            manager: UserMapper.toReadManagerCoreDTO(schedule.manager)
        };
    }
    public static scheduleCore_ToReadDTO(schedule: Schedule_Core): ScheduleCoreDTO {
        return {
            ...schedule,
            ...schedule.hoursToISOString()
        };
    }

    /**
     * Convertit une entité Schedule en ScheduleListItemDTO (liste simplifiée)
     * Utilisé pour GET /schedules (liste)
     */
    public static toListItemDTO(schedules: Schedule_Core[]): ScheduleListItemDTO[] {
        return schedules.map(schedule => ({
            ...schedule,
            ...schedule.hoursToISOString()
        }))
    }

    /**
     * Convertit une entité Schedule en ScheduleWithUsersDTO (avec liste des utilisateurs)
     * Utilisé pour GET /schedules/:id?include=users
     */
    public static toWithUsersDTO(schedule: Schedule, users: UserEmployee_Core[]): ScheduleWithUsersDTO {
        return {
            ...this.toReadDTO(schedule),
            users:UserMapper.UserEmployeeToListDTO(users)
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
            ...dto,
            managerId: managerId,
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
