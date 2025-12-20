import { Exception } from "@/domain/entities/exception";
import { ExceptionReadDTO, UserReadEmployeeDTO_Core, UserReadManagerDTO_Core } from "@/application/DTOS";
import { UserMapper } from "@/application/mappers/user";

export namespace ExceptionMapper {

    export class FromEntity {

        /**
         * Convertit une entité Exception en ExceptionReadDTO (détail complet avec relations)
         * Utilisé pour GET /exceptions/:id
         */
        public static toReadDTO(exception: Exception): ExceptionReadDTO {
            return {
                ...exception,
                startDateTime: exception.startDateTime.toISOString(),
                endDateTime: exception.endDateTime.toISOString(),
                validatedAt: exception.validatedAt ? exception.validatedAt.toISOString() : null,
                createdAt: exception.createdAt.toISOString(),
                updatedAt: exception.updatedAt.toISOString(),
                deletedAt: exception.deletedAt ? exception.deletedAt.toISOString() : null,
                employe: UserMapper.FromEntityCore.toReadDTO_Core(exception.employe) as UserReadEmployeeDTO_Core,
                validator: exception.validator ? UserMapper.FromEntityCore.toReadDTO_Core(exception.validator) as UserReadManagerDTO_Core : null,
            };
        }
    }
}
