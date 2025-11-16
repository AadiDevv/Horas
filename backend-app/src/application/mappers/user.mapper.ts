import {
    User,
    UserEmployee,
    UserManager,
    User_Core,
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
    UserUpdateDTO
} from "@/application/DTOS/";
import { } from "@/application/DTOS/team.dto";

/**
 * Mapper pour convertir les entités User en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */
export class UserMapper {
    // #region Type Guards

    /**
     * Vérifie si un User est un UserEmployee
     */
    public static isUserEmployee(user: User_Core): user is UserEmployee {
        return user.role === "employe";
    }

    /**
     * Vérifie si un User est un UserManager
     */
    public static isUserManager(user: User_Core): user is UserManager {
        return user.role === "manager";
    }
    // #endregion

    // #region Transformation Entité → DTO

    /**
     * Convertit une entité User en UserReadDTO (détail complet)
     * Utilisé pour GET /users/:id
     */
    public static toReadDTO(user: User): UserReadEmployeeDTO | UserReadManagerDTO {
        if (this.isUserEmployee(user)) {
            return this.toEmployeeReadDTO(user);
        }
        return this.toManagerReadDTO(user);
    }

    /**
     * Convertit un UserEmployee en UserReadEmployeeDTO
     */
    private static toEmployeeReadDTO(employee: UserEmployee): UserReadEmployeeDTO {
        return {
            ...employee,
            ...employee.dateToISOString()
        };
    }

    /**
     * Convertit un UserManager en UserReadManagerDTO
     */
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

    /**
     * Convertit une entité User en UserListItemDTO (liste simplifiée)
     * Utilisé pour GET /users (liste)
     */
    public static toListItemDTO(users: User_Core[]): UserEmployeeListItemDTO | UserManagerListItemDTO {

        if (this.isUserEmployee(users[0])) {
        }
        // Manager n'a pas de team
        return {
        };
    }
    private static toListEmployeeDTO(user: User):

    /**
     * Convertit une entité User en UserAuthDTO
     * Utilisé pour les réponses d'authentification (login, register)
     */
    public static toAuthDTO(user: User): UserAuthDTO {
        const base = {
            ...user,
            ...user.dateToISOString(),
        };

        if (this.isUserEmployee(user)) {
            return {
                ...base,
                teamId: user.team?.id,
                customScheduleId: user.customSchedule?.id,
            } as UserAuthDTO;
        }

        // Manager
        return {
            ...base,
            teamId: undefined,
            customScheduleId: undefined,
        } as UserAuthDTO;
    }

    /**
     * Convertit l'utilisateur en TeamManagerDTO
     * Utilisé dans les DTOs d'équipe pour afficher les infos du manager
     */
    public static toTeamManagerDTO(user: User): TeamManagerDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        };
    }

    /**
     * Convertit l'utilisateur en TeamMembreDTO
     * Utilisé dans les DTOs d'équipe pour afficher les infos des membres
     */
    public static toTeamMemberDTO(user: User): TeamMembreDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            phone: user.phone,
        };
    }
    // #endregion

    // #region Transformation DTO → Entité (Factory)

    /**
     * Crée une entité UserEmployee_Core à partir d'un DTO de création employé
     * Utilisé lors de la création d'un employé
     */
    public static fromCreateEmployeeDTO(
        dto: UserCreateEmployeeDTO,
        hashedPassword: string
    ): UserEmployee_Core {
        return new UserEmployee_Core({
            id: 0, // Sera généré par Prisma
            ...dto,
            hashedPassword,
            isActive: true,
            teamId: dto.teamId ?? null,
            customScheduleId: dto.customScheduleId ?? null,
        });
    }

    /**
     * Crée une entité UserManager_Core à partir d'un DTO de création manager
     * Utilisé lors de la création d'un manager
     */
    public static fromCreateManagerDTO(
        dto: UserCreateManagerDTO,
        hashedPassword: string
    ): UserManager_Core {
        return new UserManager_Core({
            id: 0, // Sera généré par Prisma
            ...dto,
            hashedPassword,
            isActive: true,
            teamIds: null,
            employeeIds: null,
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
