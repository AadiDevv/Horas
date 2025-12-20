import { Exception_Core } from "@/domain/entities/exception";
import { ExceptionReadDTO_Core } from "@/application/DTOS";

export namespace ExceptionMapper {

    export class FromEntityCore {

        /**
         * Convertit une entité Exception_Core en ExceptionReadDTO_Core
         * Utilisé après création ou pour listes
         */
        public static toReadDTO_Core(exception: Exception_Core): ExceptionReadDTO_Core {
            return {
                ...exception,
                startDateTime: exception.startDateTime.toISOString(),
                endDateTime: exception.endDateTime.toISOString(),
                validatedAt: exception.validatedAt ? exception.validatedAt.toISOString() : null,
            };
        }
    }
}
