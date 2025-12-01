import {
    User,
    UserEmployee,
    UserManager,
    UserEmployee_Core,
    UserManager_Core
} from "@/domain/entities/user";
import {
    UserReadEmployeeDTO,
    UserReadManagerDTO,
    UserEmployeeListItemDTO,
    UserManagerListItemDTO,
    UserAuthDTO,
    UserCreateEmployeeDTO,
    UserCreateManagerDTO,
    UserUpdateDTO,
    UserReadEmployeeCoreDTO,
    UserReadManagerCoreDTO
} from "@/application/DTOS/";
import { } from "@/application/DTOS/team.dto";
import { Role } from "@/domain/types";

/**
 * Mapper pour convertir les entités User en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */

type User_Core = UserEmployee_Core | UserManager_Core
export class UserMapper {
    // #region Type Guards

    public static isUserEmployee(user: User_Core): user is UserEmployee_Core {
        return user.role === "employe";
    }

    public static isUserManager(user: User_Core): user is UserManager_Core {
        return user.role === "manager";
    }
    // #endregion

    //Transformation Entité → DTO
    // #region READ
    public static toReadDTO(user: User): UserReadEmployeeDTO | UserReadManagerDTO {
        if (this.isUserEmployee(user)) {
            return this.toEmployeeReadDTO(user);
        }
        return this.toManagerReadDTO(user);
    }
    private static toEmployeeReadDTO(employee: UserEmployee): UserReadEmployeeDTO {
        return {
            ...employee,
            ...employee.dateToISOString()
        };
    }

    private static toManagerReadDTO(manager: UserManager): UserReadManagerDTO {
        return {
            ...manager,
            ...manager.dateToISOString(),
            employes: manager.employes?.map(emp => ({
                id: emp.id,
                firstName: emp.firstName,
                lastName: emp.lastName,
            })) ?? [],
        } as UserReadManagerDTO;
    }
    // #region READ CORE
    public static toReadEmployeeCoreDTO(user: UserEmployee_Core): UserReadEmployeeCoreDTO  {
        if (this.isUserEmployee(user)) {
            return {
                ...user
            };
        } else throw new Error('Type d’utilisateur inconnu pour le mapping CoreDTO');
    }
    public static toReadManagerCoreDTO(user: UserManager_Core): UserReadManagerCoreDTO {
        if (this.isUserManager(user)) {
            return {
                ...user
            };
        } else 
        throw new Error('Type d’utilisateur inconnu pour le mapping CoreDTO');
    }

    // #region READ LIST CORE
    public static UserEmployeeToListDTO(users: UserEmployee_Core[]): UserEmployeeListItemDTO{
            return users 
    }
    public static UserManagerToListDTO(users: UserManager_Core[]): UserManagerListItemDTO{
        return users 
}

    /**
     * Convertit une entité User en UserAuthDTO
     * Utilisé pour les réponses d'authentification (login, register)
     */
    public static toAuthDTO(user: User_Core): UserAuthDTO {
            return {
                ...user,
            } ;

    }

    // #endregion
    // #region Transformation DTO → Entité (Factory)

    /**
     * Crée une entité UserEmployee_Core à partir d'un DTO de création employé
     * Utilisé lors de la création d'un employé
     */
    public static fromCreateEmployeeDTO(
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
            customScheduleId: dto.customScheduleId ?? null,
            role
        });
    }

    /**
     * Crée une entité UserManager_Core à partir d'un DTO de création manager
     * Utilisé lors de la création d'un manager
     */
    public static fromCreateManagerDTO(
        dto: UserCreateManagerDTO,
        hashedPassword: string,
        role : Extract<Role, "manager">
    ): UserManager_Core {
        return new UserManager_Core({
            id: 0, // Sera généré par Prisma
            ...dto,
            hashedPassword,
            isActive: true,
            teamIds: null,
            employeeIds: null,
            role
        });
    }

    /**
     * Met à jour une entité UserEmployee existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public static fromUpdateEmployeeDTO(
        existingEmployee: UserEmployee,
        dto: UserUpdateDTO
    ): UserEmployee {
        return new UserEmployee({
            ...existingEmployee,
            firstName: dto.firstName ?? existingEmployee.firstName,
            lastName: dto.lastName ?? existingEmployee.lastName,
            email: dto.email ?? existingEmployee.email,
            phone: dto.phone ?? existingEmployee.phone,
            role: dto.role ?? existingEmployee.role,
            isActive: dto.isActive ?? existingEmployee.isActive,
            updatedAt: new Date(),
        });
    }

    /**
     * Met à jour une entité UserManager existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public static fromUpdateManagerDTO(
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
    public static fromUpdateDTO(existingUser: User, dto: UserUpdateDTO): User {
        if (this.isUserEmployee(existingUser)) {
            return this.fromUpdateEmployeeDTO(existingUser, dto);
        }

        if (this.isUserManager(existingUser)) {
            return this.fromUpdateManagerDTO(existingUser, dto);
        }

        throw new Error("Type d'utilisateur inconnu");
    }
    // #endregion
}
