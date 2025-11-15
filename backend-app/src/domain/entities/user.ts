import { UserProps_Core, UserProps_L1, UserProps } from "../types/entitiyProps";
import { ForbiddenError, ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { UserCreateDTO, UserUpdateDTO } from "@/application/DTOS/";
import { Role } from "../types";
import { Team, Schedule } from "./";

/**
 * User_Core
 * Représente le minimum métier pour qu'un utilisateur soit valide
 * Utilisé avant l'insertion en base de données
 */
export class User_Core {
    public firstName: string;
    public lastName: string;
    public email: string;
    public phone: string;
    public hashedPassword: string;
    public role: Role;
    public isActive: boolean;
    public teamId: number | null;
    public managerId: number | null;
    public customScheduleId: number | null;

    constructor(props: UserProps_Core) {
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.phone = props.phone;
        this.hashedPassword = props.hashedPassword;
        this.role = props.role;
        this.isActive = props.isActive;
        this.teamId = props.teamId;
        this.managerId = props.managerId;
        this.customScheduleId = props.customScheduleId;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!User_Core.validateEmail(this.email)) {
            throw new ValidationError('Format d\'email invalide');
        }

        if (this.hashedPassword && !User_Core.validatePassword(this.hashedPassword)) {
            throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
        }

        if (!User_Core.validateLastName(this.lastName)) {
            throw new ValidationError('Nom invalide (minimum 2 caractères)');
        }

        if (!User_Core.validateFirstName(this.firstName)) {
            throw new ValidationError('Prénom invalide (minimum 2 caractères)');
        }

        if (this.phone && this.phone.trim() !== '' && !User_Core.validatePhone(this.phone)) {
            throw new ValidationError('Format de téléphone invalide');
        }
    }

    public validateEmployee(): void {
        this.validate();
        if (this.role !== "employe") {
            throw new ValidationError('Role invalide pour un employé');
        }
        if (!this.managerId) {
            throw new ValidationError('Manager ID requis pour un employé');
        }
    }

    public validateManager(): void {
        this.validate();
        if (this.role !== "manager") {
            throw new ValidationError('Role invalide pour un manager');
        }
        if (this.teamId) {
            throw new ValidationError('Un manager ne peut pas avoir d\'équipe');
        }
        if (this.managerId) {
            throw new ValidationError('Un manager ne peut pas avoir de manager');
        }
    }

    // Static validation methods
    public static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public static validatePassword(password: string): boolean {
        return password.length >= 6;
    }

    public static validateLastName(lastName: string): boolean {
        return lastName.length >= 2;
    }

    public static validateFirstName(firstName: string): boolean {
        return firstName.length >= 2;
    }

    public static validatePhone(phone: string): boolean {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    public static validateDTO(dto: UserCreateDTO): void {
        if (!User_Core.validateEmail(dto.email)) {
            throw new ValidationError('Format d\'email invalide');
        }

        if (!this.validatePassword(dto.password)) {
            throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
        }

        if (!this.validateLastName(dto.lastName)) {
            throw new ValidationError('Nom invalide (minimum 2 caractères)');
        }

        if (!this.validateFirstName(dto.firstName)) {
            throw new ValidationError('Prénom invalide (minimum 2 caractères)');
        }

        if (dto.phone && dto.phone.trim() !== '' && !this.validatePhone(dto.phone)) {
            throw new ValidationError('Format de téléphone invalide');
        }
    }
    // #endregion

    // #region Authentication
    public async verifyPassword(plainPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, this.hashedPassword || '');
    }
    // #endregion

    // #region State Changes
    public activate(): void {
        this.isActive = true;
    }

    public deactivate(): void {
        this.isActive = false;
    }
    // #endregion

    // #region Display Methods
    public getDisplayName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
    // #endregion
}

/**
 * User_L1
 * Enrichissement : ajout des metadata (id, createdAt, updatedAt, etc.)
 * Utilisé après récupération de la DB sans jointures
 */
export class User_L1 extends User_Core {
    public readonly id: number;
    public createdAt: Date;
    public updatedAt: Date;
    public lastLoginAt: Date;
    public deletedAt: Date | null;

    constructor(props: UserProps_L1) {
        const { createdAt, updatedAt, lastLoginAt, deletedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.id = props.id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.deletedAt = deletedAt;
    }

    // #region State Changes (deletedAt)
    public softDelete(): void {
        this.deletedAt = new Date();
    }

    public restore(): void {
        this.deletedAt = null;
    }
    // #endregion

    // #region Authentication
    public toJwtPayload(): Record<string, any> {
        return {
            sub: this.id,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            role: this.role,
            isActive: this.isActive,
            lastLoginAt: this.lastLoginAt
        };
    }

    public updateLastLogin(): void {
        this.lastLoginAt = new Date();
    }
    // #endregion

    // #region Permissions
    public static validateUpdateProfilePermissions(
        targetUser: User_L1,
        dto: UserUpdateDTO,
        requestingUserId: number,
        requestingUserRole: string,
    ): void {
        // Admin peut tout modifier
        if (requestingUserRole === 'admin') {
            return;
        }

        // Manager et Employé : restrictions strictes
        if (requestingUserRole === 'manager' || requestingUserRole === 'employe') {
            // Vérifier que c'est leur propre profil
            if (targetUser.id !== requestingUserId) {
                throw new ForbiddenError("Vous ne pouvez modifier que votre propre profil");
            }

            // Champs interdits pour manager/employé
            const forbiddenFields: string[] = [];

            if (dto.role !== undefined) {
                forbiddenFields.push('role');
            }

            if (dto.isActive !== undefined) {
                forbiddenFields.push('isActive');
            }

            if (forbiddenFields.length > 0) {
                throw new ForbiddenError(
                    `Vous n'avez pas le droit de modifier les champs suivants : ${forbiddenFields.join(', ')}. ` +
                    `Seuls les administrateurs peuvent modifier ces informations.`
                );
            }
        }
    }
    // #endregion
}

/**
 * User
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'un utilisateur
 */
export class User extends User_L1 {
    public team?: Team;
    public manager?: User;
    public customSchedule?: Schedule;

    constructor(props: UserProps) {
        const { team, manager, customSchedule, ...propsL1 } = props;
        super({ ...propsL1 });

        this.team = team;
        this.manager = manager;
        this.customSchedule = customSchedule;
    }
}