import { User, User_Core } from "@/domain/entities/user";
import {
    UserReadEmployeeDTO,
    UserReadManagerDTO,
    BaseUserReadDTO,
    UserListItemDTO,
    UserAuthDTO,
    UserCreateDTO,
    UserCreateEmployeeDTO,
    UserUpdateDTO
} from "@/application/DTOS/";
import { TeamManagerDTO, TeamMembreDTO } from "@/application/DTOS/team.dto";
import * as bcrypt from "bcrypt";

/**
 * Mapper pour convertir les entités User en DTOs et vice-versa
 * Remplace les méthodes toXDTO() et fromXDTO() de l'entité (anti-pattern #2)
 */
export class UserMapper {
    // #region Transformation Entité → DTO

    /**
     * Convertit une entité User en UserReadDTO (détail complet)
     * Utilisé pour GET /users/:id
     */
    public static toReadDTO(user: User): UserReadEmployeeDTO | UserReadManagerDTO | BaseUserReadDTO {
        const base = {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt.toISOString(),
            deletedAt: user.deletedAt?.toISOString(),
        };

        if (user.role === "employe") {
            return {
                ...base,
                manager: user.manager ? {
                    ...user.manager,
                } : undefined,
            } as UserReadEmployeeDTO;
        }

        if (user.role === "manager") {
            return {
                ...base,
                employees: undefined, // TODO: gérer la liste des employés si nécessaire
            } as UserReadManagerDTO;
        }

        return base;
    }

    /**
     * Convertit une entité User en UserListItemDTO (liste simplifiée)
     * Utilisé pour GET /users (liste)
     */
    public static toListItemDTO(user: User): UserListItemDTO {
        return {
            ...user,
            teamId: user.team?.id,
        };
    }

    /**
     * Convertit une entité User en UserAuthDTO
     * Utilisé pour les réponses d'authentification (login, register)
     */
    public static toAuthDTO(user: User): UserAuthDTO {
        return {
            ...user,
            teamId: user.team?.id,
            customScheduleId: user.customSchedule?.id,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLoginAt: user.lastLoginAt.toISOString(),
            deletedAt: user.deletedAt?.toISOString(),
        };
    }

    /**
     * Convertit l'utilisateur en TeamManagerDTO
     * Utilisé dans les DTOs d'équipe pour afficher les infos du manager
     */
    public static toTeamManagerDTO(user: User): TeamManagerDTO {
        return {
            ...user,
        };
    }

    /**
     * Convertit l'utilisateur en TeamMembreDTO
     * Utilisé dans les DTOs d'équipe pour afficher les infos des membres
     */
    public static toTeamMemberDTO(user: User): TeamMembreDTO {
        return {
            ...user,
        };
    }
    // #endregion

    // #region Transformation DTO → Entité (Factory)

    /**
     * Crée une entité User_Core à partir d'un DTO de création
     * Utilisé lors de la création d'un nouvel utilisateur
     */
    public static async fromCreateDTO(dto: UserCreateDTO, hashedPassword: string): Promise<User_Core> {
        return new User_Core({
            ...dto,
            hashedPassword,
            isActive: true,
            teamId: null,
            managerId: null,
            customScheduleId: null,
        });
    }

    /**
     * Crée une entité User_Core à partir d'un DTO de création employé
     * Utilisé lors de la création d'un employé avec manager/team
     */
    public static async fromCreateEmployeeDTO(dto: UserCreateEmployeeDTO, hashedPassword: string): Promise<User_Core> {
        return new User_Core({
            ...dto,
            hashedPassword,
            isActive: true,
            teamId: dto.teamId ?? null,
            managerId: dto.managerId,
            customScheduleId: dto.customScheduleId ?? null,
        });
    }

    /**
     * Met à jour une entité User existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public static fromUpdateDTO(
        existingUser: User,
        dto: UserUpdateDTO & { teamId?: number; customScheduleId?: number }
    ): User {
        return new User({
            ...existingUser,
            ...dto,
            teamId: dto.teamId !== undefined ? dto.teamId : existingUser.teamId,
            customScheduleId: dto.customScheduleId !== undefined ? dto.customScheduleId : existingUser.customScheduleId,
            updatedAt: new Date(),
        });
    }
    // #endregion
}
