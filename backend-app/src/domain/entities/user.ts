import { UserProps } from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import * as bcrypt from "bcrypt";
import { UserCreateDTO } from "@/application/DTOS";
import { EquipeManagerDTO, EquipeMembreDTO } from "@/application/DTOS/equipe.dto";
import { Role } from "../types";

export class User {
  public readonly id?: number;
  public email: string;
  public hashedPassword: string;
  public prenom: string;
  public nom: string;
  public role: Role;
  public isActive: boolean;

  public createdAt: Date;
  public updatedAt?: Date;
  public lastLoginAt?: Date;
  public deletedAt?: Date;

  public telephone?: string;
  public equipeId?: number;
  public horaireId?: number;

  constructor(
    props: UserProps
  ) {
    // Attribution des valeurs
    this.id = props.id;
    this.email = props.email;
    this.hashedPassword = props.hashedPassword;
    this.prenom = props.prenom;
    this.nom = props.nom;
    this.role = props.role;
    this.isActive = props.isActive;
    this.telephone = props.telephone;
    this.equipeId = props.equipeId;
    this.horaireId = props.horaireId;
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

    if (!User.validatePassword(this.hashedPassword)) {
      throw new ValidationError('Mot de passe trop faible (minimum 6 caractères)');
    }

    if (!User.validateNom(this.nom)) {
      throw new ValidationError('Nom invalide (minimum 2 caractères)');
    }

    if (!User.validatePrenom(this.prenom)) {
      throw new ValidationError('Prénom invalide (minimum 2 caractères)');
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

    if (!this.validateNom(dto.nom)) {
      throw new ValidationError('Nom invalide (minimum 2 caractères)');
    }

    if (!this.validatePrenom(dto.prenom)) {
      throw new ValidationError('Prénom invalide (minimum 2 caractères)');
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

  public static validateNom(nom: string): boolean {
    return nom.length >= 2;
  }

  public static validatePrenom(prenom: string): boolean {
    return prenom.length >= 2;
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
      prenom: this.prenom,
      nom: this.nom,
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
    return `${this.prenom} ${this.nom}`;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      prenom: this.prenom,
      nom: this.nom,
      role: this.role,
      isActive: this.isActive,
      telephone: this.telephone,
      equipeId: this.equipeId,
      horaireId: this.horaireId,
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
      prenom: this.prenom,
      nom: this.nom,
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
      prenom: this.prenom,
      nom: this.nom,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      telephone: this.telephone,
      horaireId: this.horaireId,
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



