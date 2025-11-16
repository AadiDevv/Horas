import { TeamProps_Core, TeamProps_L1, TeamProps } from "../types/entitiyProps";
import { User_Core, Schedule_Core } from "./";
import { ValidationError } from "../error/AppError";

/**
 * Team_Core
 * Représente le minimum métier pour qu'une équipe soit valide
 * Utilisé avant l'insertion en base de données
 */
export class Team_Core {
    public readonly id: number;
    public name: string;
    public description: string | null;
    public managerId: number;
    public scheduleId: number | null;
    public membersCount: number;

    constructor(props: TeamProps_Core) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.managerId = props.managerId;
        this.scheduleId = props.scheduleId;
        this.membersCount = props.membersCount;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!this.name || this.name.trim().length < 2) {
            throw new ValidationError("Le nom de l'équipe doit contenir au moins 2 caractères");
        }
        if (!this.managerId || this.managerId <= 0) {
            throw new ValidationError("L'équipe doit avoir un manager valide");
        }
    }
    // #endregion

    // #region Display Methods
    public getDisplayName(): string {
        return this.name;
    }
    // #endregion
}

/**
 * Team_L1
 * Enrichissement : ajout des metadata (createdAt, updatedAt, deletedAt)
 * Utilisé après récupération de la DB sans jointures
 */
export class Team_L1 extends Team_Core {
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(props: TeamProps_L1) {
        const { createdAt, updatedAt, deletedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
}

/**
 * Team
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'une équipe
 */
export class Team extends Team_L1 {
    public manager: User_Core;
    public members: User_Core[];
    public schedule: Schedule_Core;

    constructor(props: TeamProps) {
        const { manager, members, schedule, ...propsL1 } = props;
        super({ ...propsL1 });

        this.manager = manager;
        this.members = members;
        this.schedule = schedule;
    }
}