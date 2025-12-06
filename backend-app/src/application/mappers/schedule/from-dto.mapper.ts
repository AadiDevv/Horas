import { Schedule, Schedule_Core } from "@/domain/entities/schedule";
import { ScheduleCreateDTO, ScheduleUpdateDTO } from "@/application/DTOS/schedule.dto";

export namespace ScheduleMapper {

    export class FromDTO {

        /**
         * Crée une entité Schedule_Core à partir d'un DTO de création
         * Utilisé lors de la création d'un nouveau schedule
         */
        public static Create_ToEntityCore(dto: ScheduleCreateDTO, managerId: number): Schedule_Core {
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
        public static Update_ToEntity(existing: Schedule, dto: ScheduleUpdateDTO): Schedule {
            return new Schedule({
                ...existing,
                name: dto.name ?? existing.name,
                startHour: dto.startHour ? Schedule_Core.parseTimeString(dto.startHour) : existing.startHour,
                endHour: dto.endHour ? Schedule_Core.parseTimeString(dto.endHour) : existing.endHour,
                activeDays: dto.activeDays ?? existing.activeDays,
                updatedAt: new Date(),
            });
        }
    }
}
