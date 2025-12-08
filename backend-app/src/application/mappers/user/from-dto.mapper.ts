import {
    User,
    UserEmployee,
    UserManager,
    UserEmployee_Core,
    UserManager_Core,
    User_Core
} from "@/domain/entities/user";
import {
    UserCreateEmployeeDTO,
    UserCreateManagerDTO,
    UserUpdateDTO,
} from "@/application/DTOS/";
import { Role } from "@/domain/types";
import { UserMapper as UserMapperUtils } from "./utils.mapper";

export namespace UserMapper {

    export class FromDTO {

        public static CreateEmployee_ToEntityCore(
            dto: UserCreateEmployeeDTO,
            hashedPassword: string,
            role : Extract<Role, "employe">
        ): UserEmployee_Core {
            return new UserEmployee_Core({
                id: 0, // Sera généré par Prisma
                ...dto,
                hashedPassword,
                isActive: true,
                teamId: dto.teamId ?? null,
                customScheduleId: null,
                role
            });
        }
    
        /**
         * Crée une entité UserManager_Core à partir d'un DTO de création manager
         * Utilisé lors de la création d'un manager
         */
        public static CreateManager_ToEntityCore(
            dto: UserCreateManagerDTO,
            hashedPassword: string,
            role : Extract<Role, "manager">
        ): UserManager_Core {
            return new UserManager_Core({
                id: 0, // Sera généré par Prisma
                ...dto,
                hashedPassword,
                isActive: true,
                role
            });
        }
    
        public static UpdateUser_ToEntity(
            existingUser: User_Core,
            dto: UserUpdateDTO
        ): User_Core {
            return new User_Core({
                ...existingUser,
                firstName: dto.firstName ?? existingUser.firstName,
                lastName: dto.lastName ?? existingUser.lastName,
                email: dto.email ?? existingUser.email,
                phone: dto.phone ?? existingUser.phone,
                role: dto.role ?? existingUser.role,
                isActive: dto.isActive ?? existingUser.isActive,
            });
        }
        /**
         * Met à jour une entité UserEmployee existante avec les données d'un DTO de mise à jour
         * Retourne une nouvelle instance (immutabilité)
         */
        public static UpdateEmployee_ToEntity(
            existingEmployee: UserEmployee_Core,
            dto: UserUpdateDTO
        ): UserEmployee_Core {
            return new UserEmployee_Core({
                ...existingEmployee,
                firstName: dto.firstName ?? existingEmployee.firstName,
                lastName: dto.lastName ?? existingEmployee.lastName,
                email: dto.email ?? existingEmployee.email,
                phone: dto.phone ?? existingEmployee.phone,
                role: dto.role ?? existingEmployee.role,
                isActive: dto.isActive ?? existingEmployee.isActive,
            });
        }
    
        /**
         * Met à jour une entité UserManager existante avec les données d'un DTO de mise à jour
         * Retourne une nouvelle instance (immutabilité)
         */
        public static UpdateManager_ToEntity(
            existingManager: UserManager,
            dto: UserUpdateDTO
        ): UserManager {
            return new UserManager({
                ...existingManager,
                firstName: dto.firstName ?? existingManager.firstName,
                lastName: dto.lastName ?? existingManager.lastName,
                email: dto.email ?? existingManager.email,
                phone: dto.phone ?? existingManager.phone,
                role: dto.role ?? existingManager.role,
                isActive: dto.isActive ?? existingManager.isActive,
                updatedAt: new Date(),
            });
        }
    
        /**
         * Met à jour une entité User (Employee ou Manager) générique
         * Détermine automatiquement le type et appelle la bonne méthode
         */
        
        // #endregion
    }
    
}