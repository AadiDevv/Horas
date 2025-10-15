import { TeamProps } from "../types/entitiyProps";
import { User } from "./user";
import { TeamCreateDTO, TeamUpdateDTO, TeamReadDTO, TeamListItemDTO, TeamWithMembresDTO } from "@/application/DTOS";
import { ValidationError } from "../error/AppError";

export class Team {
    public readonly id?: number;
    public lastName: string;
    public description?: string;
    public managerId: number;
    public scheduleId?: number;
    public createdAt: Date;
    public updatedAt?: Date;
    public deletedAt?: Date | null;
    public manager?: User;
    public membres?: User[];
    public membresCount?: number;

    constructor(props: TeamProps) {
        this.id = props.id;
        this.lastName = props.lastName;
        this.description = props.description;
        this.managerId = props.managerId;
        this.scheduleId = props.scheduleId;
        this.createdAt = props.createdAt || new Date(Date.now());
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt || null;
        this.manager = props.manager;
        this.membres = props.membres;
        this.membresCount = props.membresCount;
        this.validate();
    }

    // #region Factory Methods (DTO → Entité)
    /**
     * Crée une entité Team à partir d'un DTO de création
     * Utilisé lors de la création d'une nouvelle équipe
     */
    static fromCreateDTO(dto: TeamCreateDTO): Team {
        return new Team({
            lastName: dto.lastName,
            description: dto.description,
            managerId: dto.managerId,
            scheduleId: dto.scheduleId,
        });
    }

    /**
     * Met à jour une entité Team existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    static fromUpdateDTO(existingTeam: Team, dto: TeamUpdateDTO): Team {
        return new Team({
            ...existingTeam,
            lastName: dto.lastName ?? existingTeam.lastName,
            description: dto.description ?? existingTeam.description,
            managerId: dto.managerId ?? existingTeam.managerId,
            scheduleId: dto.scheduleId ?? existingTeam.scheduleId,
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
     * Convertit l'entité en TeamReadDTO (détail complet)
     * Utilisé pour GET /teams/:id
     */
    toReadDTO(): TeamReadDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");

        return {
            id: this.id,
            lastName: this.lastName,
            description: this.description,
            managerId: this.managerId,
            scheduleId: this.scheduleId,
            ...this.toDateStrings(),
            manager: this.manager?.toTeamManagerDTO(),
            membresCount: this.membres?.length ?? this.membresCount ?? 0,
        };
    }

    /**
     * Convertit l'entité en TeamListItemDTO (liste simplifiée)
     * Utilisé pour GET /teams (liste)
     */
    toListItemDTO(): TeamListItemDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");

        return {
            id: this.id,
            lastName: this.lastName,
            description: this.description,
            managerId: this.managerId,
            scheduleId: this.scheduleId,
            managerlastName: this.manager ? `${this.manager.firstName} ${this.manager.lastName}` : "Manager inconnu",
            membresCount: this.membres?.length ?? this.membresCount ?? 0,
            createdAt: this.createdAt.toISOString(),
        };
    }

    /**
     * Convertit l'entité en TeamWithMembresDTO (avec liste des membres)
     * Utilisé pour GET /teams/:id?include=membres
     */
    toWithMembresDTO(): TeamWithMembresDTO {
        if (!this.id) throw new ValidationError("L'équipe doit avoir un ID pour être convertie en DTO");
        if (!this.membres) throw new ValidationError("Les membres doivent être chargés pour utiliser toWithMembresDTO()");

        return {
            ...this.toReadDTO(),
            membres: this.membres.map(membre => membre.toTeamMembreDTO()),
        };
    }
    // #endregion

    // #region Validation Methods
    /**
     * Valide les données de l'équipe
     * Peut être appelée avant la sauvegarde
     */
    validate(): void {
        if (!this.lastName || this.lastName.trim().length < 2) {
            throw new ValidationError("Le lastName de l'équipe doit contenir au moins 2 caractères");
        }
        if (!this.managerId || this.managerId <= 0) {
            throw new ValidationError("L'équipe doit avoir un manager valide");
        }
    }
    // #endregion

    // #region Business Methods
    /**
     * Retourne le lastName d'affichage de l'équipe
     */
    getDisplayName(): string {
        return this.lastName;
    }
    // #endregion
}