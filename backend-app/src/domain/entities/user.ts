import { UserProps } from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { UserCreateDTO } from "@/application/DTOS";

export class User {
  public readonly id?: string;
  public email: string;
  public hashedPassword: string;
  public username: string;
  public isActive: boolean;
  public isAdmin: boolean;

  public createdAt: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date;

  public phone?: string;
  public address?: string;

  constructor(
    props: UserProps
  ) {
    // Attribution des valeurs
    this.id = props.id;
    this.email = props.email;
    this.hashedPassword = props.hashedPassword;
    this.username = props.username;
    this.isActive = props.isActive;
    this.isAdmin = props.isAdmin;
    this.phone = props.phone;
    this.address = props.address;
    this.createdAt = props.createdAt || new Date(Date.now())
    this.updatedAt = props.updatedAt;
    this.lastLoginAt = props.lastLoginAt;

    // Validation après attribution
    this.validateMe();
  }

  // #region UserValidation Methods
  public validateMe(): void {
    if (!User.validateEmail(this.email)) {
      throw new ValidationError('Format d\'email invalide');
    }

    if (!User.validatePassword(this.hashedPassword)) {
      throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
    }

    if (!User.validateUsername(this.username)) {
      throw new ValidationError('Nom d\'utilisateur invalide (minimum 3 caractères, alphanumérique + underscore)');
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

    if (!this.validateUsername(dto.username)) {
      throw new ValidationError('Nom d\'utilisateur invalide (minimum 3 caractères, alphanumérique + underscore)');
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

  public static validateUsername(username: string): boolean {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  public static validatePassword(password: string): boolean {
    return password.length >= 6;
  }
  // #endregion

  // #region UserAuthentication Methods

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.hashedPassword);
  }
  public toJwtPayload(): Record<string, any> {
    if (!this.id) {
      throw new Error('Impossible de générer JWT pour un utilisateur sans ID');
    }

    return {
      sub: this.id,
      email: this.email,
      username: this.username,
      isAdmin: this.isAdmin,
      lastLoginAt: this.lastLoginAt
    };
  }

  public updateLastLogin(): void {
    this.lastLoginAt = new Date(Date.now());
  }
  // #endregion

  // #region UserDisplay Methods
  public getDisplayName(): string {
    return this.username.charAt(0).toUpperCase() + this.username.slice(1);
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      isActive: this.isActive,
      isAdmin: this.isAdmin,
      phone: this.phone,
      address: this.address,
      createdAt: this.createdAt?.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString()
    };
  }
  // #endregion

  // #region Change UserState Methods


  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }
  // #endregion

  // #region UserFactory Methods
  public static fromCreateDTOtoEntity(dto: UserCreateDTO, hashedPassword: string): User {
    const userProps: UserProps = {
      ...dto,
      hashedPassword,
      isActive: false,
      isAdmin: false,
    }
    return new User(
      userProps)
  }
  // #endregion
}



