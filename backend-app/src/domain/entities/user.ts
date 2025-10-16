import { UserProps } from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { UserCreateDTO } from "@/application/DTOS";
import { TeamManagerDTO, TeamMembreDTO } from "@/application/DTOS/team.dto";
import { Role } from "../types";

export class User {
  public readonly id?: number;
  public email: string;
  public hashedPassword?: string;
  public firstName: string;
  public lastName: string;
  public role: Role;
  public isActive: boolean;

  public createdAt: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date;
  public deletedAt?: Date;

  public phone?: string;
  public teamId?: number;
  public scheduleId?: number;

  constructor(
    props: UserProps
  ) {
    // Attribution des values
    this.id = props.id;
    this.email = props.email;
    this.hashedPassword = props.hashedPassword;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.role = props.role;
    this.isActive = props.isActive;
    this.phone = props.phone;
    this.teamId = props.teamId;
    this.scheduleId = props.scheduleId;
    this.createdAt = props.createdAt || new Date(Date.now())
    this.updatedAt = props.updatedAt;
    this.lastLoginAt = props.lastLoginAt;
    this.deletedAt = props.deletedAt;

    // Validation après attribution
    this.validateMe();
  }

  // #region UserValidation Methods
  public validateMe(): void {
    if (!User.validateEmail(this.email)) {
      throw new ValidationError('Format d\'email invalide');
    }

    if (this.hashedPassword && !User.validatePassword(this.hashedPassword)) {
      throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
    }

    if (!User.validatelastName(this.lastName)) {
      throw new ValidationError('lastName invalide (minimum 2 caractères)');
    }

    if (!User.validatefirstName(this.firstName)) {
      throw new ValidationError('PrélastName invalide (minimum 2 caractères)');
    }

    if (this.phone && this.phone.trim() !== '' && !User.validatePhone(this.phone)) {
      throw new ValidationError('Format de téléphone invalide');
    }
  }

  public static validateDTO(dto: UserCreateDTO): void {
    if (!User.validateEmail(dto.email)) {
      throw new ValidationError('Format d\'email invalide');
    }

    if (!this.validatePassword(dto.password)) {
      throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
    }

    if (!this.validatelastName(dto.lastName)) {
      throw new ValidationError('lastName invalide (minimum 2 caractères)');
    }

    if (!this.validatefirstName(dto.firstName)) {
      throw new ValidationError('PrélastName invalide (minimum 2 caractères)');
    }

    if (dto.phone && dto.phone.trim() !== '' && !this.validatePhone(dto.phone)) {
      throw new ValidationError('Format de téléphone invalide');
    }
  }

  public static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone!);
  }

  public static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static validatelastName(lastName: string): boolean {
    return lastName.length >= 2;
  }

  public static validatefirstName(firstName: string): boolean {
    return firstName.length >= 2;
  }

  public static validatePassword(password: string): boolean {
    return password.length >= 6;
  }
  // #endregion

  // #region UserAuthentication Methods

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.hashedPassword || '');
  }

  public toJwtPayload(): Record<string, any> {
    if (!this.id) {
      throw new Error('Impossible de générer JWT pour un utilisateur sans ID');
    }

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
    this.lastLoginAt = new Date(Date.now());
  }
  // #endregion

  // #region UserDisplay Methods
  public getDisplayName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      phone: this.phone,
      teamId: this.teamId,
      scheduleId: this.scheduleId,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString(),
      deletedAt: this.deletedAt?.toISOString()
    };
  }
  // #endregion

  // #region Transformation Methods (pour Team)
  /**
   * Convertit l'utilisateur en TeamManagerDTO
   * Utilisé dans les DTOs d'équipe pour afficher les infos du manager
   */
  public toTeamManagerDTO(): TeamManagerDTO {
    if (!this.id) {
      throw new ValidationError("L'utilisateur doit avoir un ID pour être converti en TeamManagerDTO");
    }

    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
    };
  }

  /**
   * Convertit l'utilisateur en TeamMembreDTO
   * Utilisé dans les DTOs d'équipe pour afficher les infos des members
   */
  public toTeamMembreDTO(): TeamMembreDTO {
    if (!this.id) {
      throw new ValidationError("L'utilisateur doit avoir un ID pour être converti en TeamMembreDTO");
    }

    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      phone: this.phone,
      scheduleId: this.scheduleId,
    };
  }
  // #endregion

  // #region Change UserState Methods

  public activate(): void {
    this.isActive = true;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = undefined;
  }
  // #endregion

  // #region UserFactory Methods
  public static fromCreateDTOtoEntity(dto: UserCreateDTO, hashedPassword: string): User {
    const userProps: UserProps = {
      ...dto,
      hashedPassword: hashedPassword,
      isActive: false,
    }
    return new User(userProps)
  }
  // #endregion
}



