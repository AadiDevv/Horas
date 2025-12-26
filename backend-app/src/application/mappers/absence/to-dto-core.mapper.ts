import { Absence_Core } from "@/domain/entities/absence";
import { AbsenceReadDTO_Core } from "@/application/DTOS";

export namespace AbsenceMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Absence_Core en AbsenceReadDTO_Core
         * Utilisé après création ou pour listes
         */
        public static toReadDTO_Core(absence: Absence_Core): AbsenceReadDTO_Core {
            return {
                ...absence,
                startDateTime: absence.startDateTime.toISOString(),
                endDateTime: absence.endDateTime.toISOString(),
                validatedAt: absence.validatedAt ? absence.validatedAt.toISOString() : null,
            };
        }
    }
}
