import { EquipeProps } from "../types/entitiyProps";
import { User } from "./user";
import { EquipeCreateDTO, EquipeUpdateDTO, EquipeReadDTO, EquipeListItemDTO, EquipeWithMembresDTO } from "@/application/DTOS";
import { ValidationError } from "../error/AppError";

export class Equipe {
    public readonly id?: number;
    public nom: string;
    public description?: string;
    public managerId: number;
    public horaireId?: number;
    public createdAt: Date;
    public updatedAt?: Date;
    public deletedAt?: Date;
    public manager?: User;
    public membres?: User[];
    public membresCount?: number;

    constructor(props: EquipeProps) {
        this.id = props.id;
        this.nom = props.nom;
        this.description = props.description;
        this.managerId = props.managerId;
        this.horaireId = props.horaireId;
        this.createdAt = props.createdAt || new Date(Date.now());
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
        this.manager = props.manager;
        this.membres = props.membres;
        this.membresCount = props.membresCount;
    }

    // #region Factory Methods (DTO → Entité)
    /**
     * Crée une entité Equipe à partir d'un DTO de création
     * Utilisé lors de la création d'une nouvelle équipe
     */
    static fromCreateDTO(dto: EquipeCreateDTO): Equipe {
        return new Equipe({
            nom: dto.nom,
            description: dto.description,
            managerId: dto.managerId,
            horaireId: dto.horaireId,
        });
    }

    /**
     * Met à jour une entité Equipe existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    static fromUpdateDTO(existingEquipe: Equipe, dto: EquipeUpdateDTO): Equipe {
        return new Equipe({
            ...existingEquipe,
            nom: dto.nom ?? existingEquipe.nom,
            description: dto.description ?? existingEquipe.description,
            managerId: dto.managerId ?? existingEquipe.managerId,
            horaireId: dto.horaireId ?? existingEquipe.horaireId,
            updatedAt: new Date(Date.now()),
        });
    }
    // #endregion

    // #region Transformation Methods (Entité → DTO)
    /**
     * Convertit les dates en ISO string
     * Helper privé pour éviter la duplication
     */
    private toDateStrings() {
        return {
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt?.toISOString(),
            deletedAt: this.deletedAt?.toISOString(),
        };
    }

    /**
     * Convertit l'entité en EquipeReadDTO (détail complet)
     * Utilisé pour GET /equipes/:id
     */
    toReadDTO(): EquipeReadDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");

        return {
            id: this.id,
            nom: this.nom,
            description: this.description,
            managerId: this.managerId,
            horaireId: this.horaireId,
            ...this.toDateStrings(),
            manager: this.manager?.toEquipeManagerDTO(),
            membresCount: this.membres?.length ?? this.membresCount ?? 0,
        };
    }

    /**
     * Convertit l'entité en EquipeListItemDTO (liste simplifiée)
     * Utilisé pour GET /equipes (liste)
     */
    toListItemDTO(): EquipeListItemDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");

        return {
            id: this.id,
            nom: this.nom,
            description: this.description,
            managerId: this.managerId,
            horaireId: this.horaireId,
            managerNom: this.manager ? `${this.manager.prenom} ${this.manager.nom}` : "Manager inconnu",
            membresCount: this.membres?.length ?? this.membresCount ?? 0,
            createdAt: this.createdAt.toISOString(),
        };
    }

    /**
     * Convertit l'entité en EquipeWithMembresDTO (avec liste des membres)
     * Utilisé pour GET /equipes/:id?include=membres
     */
    toWithMembresDTO(): EquipeWithMembresDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");
        if (!this.membres) throw new ValidationError("Les membres doivent être chargés pour utiliser toWithMembresDTO()");

        return {
            ...this.toReadDTO(),
            membres: this.membres.map(membre => membre.toEquipeMembreDTO()),
        };
    }
    // #endregion

    // #region Validation Methods
    /**
     * Valide les données de l'équipe
     * Peut être appelée avant la sauvegarde
     */
    validate(): void {
        if (!this.nom || this.nom.trim().length < 2) {
            throw new ValidationError("Le nom de l'équipe doit contenir au moins 2 caractères");
        }
        if (!this.managerId || this.managerId <= 0) {
            throw new ValidationError("L'équipe doit avoir un manager valide");
        }
    }
    // #endregion

    // #region Business Methods
    /**
     * Retourne le nom d'affichage de l'équipe
     */
    getDisplayName(): string {
        return this.nom;
    }
    // #endregion
}