import { Absence_L1 } from "@/domain/entities/absence";
import { AbsenceReadDTO_L1 } from "@/application/DTOS";

export namespace AbsenceMapper {

    export class FromEntityL1 {

        /**
         * Convertit une entité Absence_L1 en AbsenceReadDTO_L1 (sans relations)
         * Utilisé pour updates
         */
        public static toReadDTO_L1(absence: Absence_L1): AbsenceReadDTO_L1 {
            return {
                ...absence,
                startDateTime: absence.startDateTime.toISOString(),
                endDateTime: absence.endDateTime.toISOString(),
                validatedAt: absence.validatedAt ? absence.validatedAt.toISOString() : null,
                createdAt: absence.createdAt.toISOString(),
                updatedAt: absence.updatedAt.toISOString(),
                deletedAt: absence.deletedAt ? absence.deletedAt.toISOString() : null,
            };
        }
    }
}
