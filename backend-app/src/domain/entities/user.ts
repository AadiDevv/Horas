import {
    UserProps_Core,
    UserEmployeeProps_Core,
    UserEmployeeProps_L1,
    UserEmployeeProps,
    UserManagerProps_Core,
    UserManagerProps_L1,
    UserManagerProps,
    UserProps_L1,
} from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { Role } from "../types";
import { Schedule_Core, Team_Core } from "./";

/**
 * User_Core (Abstract)
 * Classe de base contenant les champs communs à tous les utilisateurs
 */
export class User_Core {
    public readonly id: number;
    public firstName: string;
    public lastName: string;
    public email: string;
    public phone: string;
    public hashedPassword: string;
    public role: Role;
    public isActive: boolean;

    constructor(props: UserProps_Core) {
        this.id = props.id;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.email = props.email;
        this.phone = props.phone;
        this.hashedPassword = props.hashedPassword;
        this.role = props.role;
        this.isActive = props.isActive;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!User_Core.validateEmail(this.email)) {
            throw new ValidationError('Format d\'email invalide');
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

    // Static validation methods
    public static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
 * UserEmployee_Core
 * Représente le minimum métier pour qu'un employé soit valide
 */
export class UserEmployee_Core extends User_Core {
    public teamId: number | null;
    public managerId: number;
    public customScheduleId: number | null;

    constructor(props: UserEmployeeProps_Core) {
        const {teamId, managerId,customScheduleId, ...superProps} = props;
        super({...superProps});

        this.teamId = teamId;
        this.managerId = managerId;
        this.customScheduleId = customScheduleId;

        // Validation spécifique employé
        this.validateEmployee();
    }

    // #region Validation Employee
    public validateEmployee(): void {
        if (this.role !== "employe") {
            throw new ValidationError('Role invalide pour un employé');
        }
        if (!this.managerId) {
            throw new ValidationError('Manager ID requis pour un employé');
        }
    }
    // #endregion
}

/**
 * UserManager_Core
 * Représente le minimum métier pour qu'un manager soit valide
 */
export class UserManager_Core extends User_Core {
    constructor(props: UserManagerProps_Core) {
        super({...props});

        // Validation spécifique manager
        this.validateManager();
    }

    // #region Validation Manager
    public validateManager(): void {
        if (this.role !== "manager") {
            throw new ValidationError('Role invalide pour un manager');
        }
    }
    // #endregion
}

/**
 * UserEmployee_L1
 * Enrichissement : ajout des metadata (createdAt, updatedAt, etc.)
 */
export class UserEmployee_L1 extends UserEmployee_Core {
    public createdAt: Date;
    public updatedAt: Date;
    public lastLoginAt: Date | null;
    public deletedAt: Date | null;

    constructor(props: UserEmployeeProps_L1) {
        const { createdAt, updatedAt, lastLoginAt, deletedAt, ...propsCore } = props;
        super({ ...propsCore });

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

    // #region Date Transformation
    public dateToISOString() {
        return {
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            lastLoginAt: this.lastLoginAt ? this.lastLoginAt.toISOString() : null,
            deletedAt: this.deletedAt ? this.deletedAt?.toISOString() : null,
        }
    }
    // #endregion

   
}

export class User_L1 extends User_Core {
    public createdAt: Date;
    public updatedAt: Date;
    public lastLoginAt: Date | null;
    public deletedAt: Date | null;

    constructor(props: UserProps_L1) {
        super({ ...props });

        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
        this.lastLoginAt = props.lastLoginAt;
        this.deletedAt = props.deletedAt;
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
    
        // #region Date Transformation
        public dateToISOString(){
            return {
                createdAt: this.createdAt.toISOString(),
                updatedAt: this.updatedAt.toISOString(),
                lastLoginAt: this.lastLoginAt ? this.lastLoginAt.toISOString() : null,
                deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
            }
        }
        // #endregion
    
}
/**
 * UserManager_L1
 * Enrichissement : ajout des metadata (createdAt, updatedAt, etc.)
 */
export class UserManager_L1 extends UserManager_Core {
    public createdAt: Date;
    public updatedAt: Date;
    public lastLoginAt: Date | null;
    public deletedAt: Date | null;

    constructor(props: UserManagerProps_L1) {
        const { createdAt, updatedAt, lastLoginAt, deletedAt, ...propsCore } = props;
        super({ ...propsCore });

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

    // #region Date Transformation
    public dateToISOString(){
        return {
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            lastLoginAt: this.lastLoginAt ? this.lastLoginAt.toISOString() : null,
            deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
        }
    }
    // #endregion
}

/**
 * UserEmployee
 * Entité complète avec toutes les jointures
 */
export class UserEmployee extends UserEmployee_L1 {
    public team: Team_Core | null;
    public manager: UserManager_Core;
    public customSchedule: Schedule_Core | null;

    constructor(props: UserEmployeeProps) {
        const { team, manager, customSchedule, ...propsL1 } = props;
        super({ ...propsL1 });

        this.team = team;
        this.manager = manager;
        this.customSchedule = customSchedule;
    }
}

/**
 * UserManager
 * Entité complète avec toutes les jointures
 */
export class UserManager extends UserManager_L1 {
    public employes: UserEmployee_Core[];
    public managedTeams: Team_Core[];

    constructor(props: UserManagerProps) {
        const { employes, managedTeams, ...propsL1 } = props;
        super({ ...propsL1 });

        this.employes = employes;
        this.managedTeams = managedTeams;
    }
}

// Type union pour compatibilité
export type User = UserEmployee | UserManager;
export type User_EntityCore = UserEmployee_Core | UserManager_Core;
