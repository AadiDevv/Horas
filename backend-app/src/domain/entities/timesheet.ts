import { TimesheetStatus } from "@/domain/types";
import { ValidationError } from "../error/AppError";
import { User } from "./user";
import { TimesheetProps, TimesheetProps_NoJoint, TimesheetProps_Core } from "../types/entitiyProps";

/**
 * Timesheet_Core
 * Représente le minimum métier pour qu'un timesheet soit valide
 * Utilisé avant l'insertion en base de données
 */
export class Timesheet_Core {
    public employeId: number;
    public date: Date;
    public hour: Date;
    public clockin: boolean;
    public status: TimesheetStatus;

    constructor(props: TimesheetProps_Core) {
        this.employeId = props.employeId;
        this.date = props.date;
        this.hour = props.hour;
        this.clockin = props.clockin;
        this.status = props.status;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!this.employeId || this.employeId <= 0) {
            throw new ValidationError("Le timesheet doit être lié à un employé valide.");
        }

        if (!(this.date instanceof Date) || isNaN(this.date.getTime())) {
            throw new ValidationError("La date du timesheet est invalide.");
        }

        if (!(this.hour instanceof Date) || isNaN(this.hour.getTime())) {
            throw new ValidationError("L'heure du timesheet est invalide.");
        }
    }
    // #endregion
}

/**
 * Timesheet_NoJoint
 * Enrichissement : ajout des propriétés de base de données (id, timestamps)
 * Utilisé après récupération de la DB sans jointures
 */
export class Timesheet_NoJoint extends Timesheet_Core {
    public readonly id: number;
    public createdAt: Date;
    public updatedAt: Date;

    constructor(props: TimesheetProps_NoJoint) {
        const { id, createdAt, updatedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // #region Business Methods
    public getDisplayDate(): string {
        return this.date.toLocaleDateString("fr-FR");
    }
    // #endregion
}

/**
 * Timesheet
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'un timesheet
 */
export class Timesheet extends Timesheet_NoJoint {
    public employe: User;

    constructor(props: TimesheetProps) {
        const { employe, ...propsNoJoint } = props;
        super({ ...propsNoJoint });

        this.employe = employe;
    }
}
