import { UserProps } from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { UserCreateDTO } from "@/application/DTOS";
import { EquipeManagerDTO, EquipeMembreDTO } from "@/application/DTOS/equipe.dto";
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

  public telephone?: string;
  public equipeId?: number;
  public plageHoraireId?: number;

  constructor(
    props: UserProps
  ) {
    // Attribution des valeurs
    this.id = props.id;
    this.email = props.email;
    this.hashedPassword = props.hashedPassword;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.role = props.role;
    this.isActive = props.isActive;
    this.telephone = props.telephone;
    this.equipeId = props.equipeId;
    this.plageHoraireId = props.plageHoraireId;
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

    if (this.telephone && this.telephone.trim() !== '' && !User.validatePhone(this.telephone)) {
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

    if (dto.telephone && dto.telephone.trim() !== '' && !this.validatePhone(dto.telephone)) {
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
      telephone: this.telephone,
      equipeId: this.equipeId,
      plageHoraireId: this.plageHoraireId,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString(),
      deletedAt: this.deletedAt?.toISOString()
    };
  }
  // #endregion

  // #region Transformation Methods (pour Equipe)
  /**
   * Convertit l'utilisateur en EquipeManagerDTO
   * Utilisé dans les DTOs d'équipe pour afficher les infos du manager
   */
  public toEquipeManagerDTO(): EquipeManagerDTO {
    if (!this.id) {
      throw new ValidationError("L'utilisateur doit avoir un ID pour être converti en EquipeManagerDTO");
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
   * Convertit l'utilisateur en EquipeMembreDTO
   * Utilisé dans les DTOs d'équipe pour afficher les infos des membres
   */
  public toEquipeMembreDTO(): EquipeMembreDTO {
    if (!this.id) {
      throw new ValidationError("L'utilisateur doit avoir un ID pour être converti en EquipeMembreDTO");
    }

    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      telephone: this.telephone,
      plageHoraireId: this.plageHoraireId,
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



