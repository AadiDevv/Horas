import { TimesheetStatus } from "@/domain/types";
import { ValidationError } from "../error/AppError";
import { UserEmployee_Core } from "./user";
import { TimesheetProps, TimesheetProps_Core, TimesheetProps_L1 } from "../types/entitiyProps";

/**
 * Timesheet_Core
 * Représente le minimum métier pour qu'un timesheet soit valide
 * Utilisé avant l'insertion en base de données
 */
export class Timesheet_Core {
    public id: number;
    public employeId: number;
    public timestamp: Date;
    public clockin: boolean;
    public status: TimesheetStatus;

    constructor(props: TimesheetProps_Core) {
        this.id = props.id;
        this.employeId = props.employeId;
        this.timestamp = props.timestamp;
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

        if (!(this.timestamp instanceof Date) || isNaN(this.timestamp.getTime())) {
            throw new ValidationError("Le timestamp du timesheet est invalide.");
        }
    }
    // #endregion
}

/**
 * Timesheet_NoJoint
 * Enrichissement : ajout des metadata (id)
 * Utilisé après récupération de la DB sans jointures
 */
export class Timesheet_L1 extends Timesheet_Core {

    public createdAt: Date;
    public updatedAt: Date;

    constructor(props: TimesheetProps_L1) {
        const { createdAt, updatedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // #region Business Methods
    public getDisplayDate(): string {
        return this.timestamp.toLocaleDateString("fr-FR");
    }
    
    public getDisplayTime(): string {
        return this.timestamp.toLocaleTimeString("fr-FR");
    }
    // #endregion
}

/**
 * Timesheet
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'un timesheet
 */
export class Timesheet extends Timesheet_L1 {
    public employe: UserEmployee_Core;

    constructor(props: TimesheetProps) {
        const { employe, ...propsNoJoint } = props;
        super({ ...propsNoJoint });

        this.employe = employe;
    }
}
