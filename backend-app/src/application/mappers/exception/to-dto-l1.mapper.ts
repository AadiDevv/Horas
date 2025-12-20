import { Exception_L1 } from "@/domain/entities/exception";
import { ExceptionReadDTO_L1 } from "@/application/DTOS";

export namespace ExceptionMapper {

    export class FromEntityL1 {

        /**
         * Convertit une entité Exception_L1 en ExceptionReadDTO_L1 (sans relations)
         * Utilisé pour updates
         */
        public static toReadDTO_L1(exception: Exception_L1): ExceptionReadDTO_L1 {
            return {
                ...exception,
                startDateTime: exception.startDateTime.toISOString(),
                endDateTime: exception.endDateTime.toISOString(),
                validatedAt: exception.validatedAt ? exception.validatedAt.toISOString() : null,
                createdAt: exception.createdAt.toISOString(),
                updatedAt: exception.updatedAt.toISOString(),
                deletedAt: exception.deletedAt ? exception.deletedAt.toISOString() : null,
            };
        }
    }
}
