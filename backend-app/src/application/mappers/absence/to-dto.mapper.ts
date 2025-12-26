import { Absence } from "@/domain/entities/absence";
import { AbsenceReadDTO, UserReadEmployeeDTO_Core, UserReadManagerDTO_Core } from "@/application/DTOS";
import { UserMapper } from "@/application/mappers/user";

export namespace AbsenceMapper {

    export class FromEntity {

        /**
         * Convertit une entité Absence en AbsenceReadDTO (détail complet avec relations)
         * Utilisé pour GET /absences/:id
         */
        public static toReadDTO(absence: Absence): AbsenceReadDTO {
            return {
                ...absence,
                startDateTime: absence.startDateTime.toISOString(),
                endDateTime: absence.endDateTime.toISOString(),
                validatedAt: absence.validatedAt ? absence.validatedAt.toISOString() : null,
                createdAt: absence.createdAt.toISOString(),
                updatedAt: absence.updatedAt.toISOString(),
                deletedAt: absence.deletedAt ? absence.deletedAt.toISOString() : null,
                employe: UserMapper.FromEntityCore.toReadDTO_Core(absence.employe) as UserReadEmployeeDTO_Core,
                validator: absence.validator ? UserMapper.FromEntityCore.toReadDTO_Core(absence.validator) as UserReadManagerDTO_Core : null,
            };
        }
    }
}
