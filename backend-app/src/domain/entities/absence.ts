import { AbsenceType, AbsenceStatus } from "@/domain/types";
import { ValidationError } from "../error/AppError";
import { UserEmployee_Core, UserManager_Core } from "./user";
import { AbsenceProps, AbsenceProps_Core, AbsenceProps_L1 } from "../types/entitiyProps";

/**
 * Absence_Core
 * Représente le minimum métier pour qu'une absence soit valide
 * Utilisé avant l'insertion en base de données
 */
export class Absence_Core {
    public id: number;
    public employeId: number;
    public type: AbsenceType;
    public status: AbsenceStatus;
    public startDateTime: Date;
    public endDateTime: Date;
    public isFullDay: boolean;
    public validatedBy: number | null;
    public validatedAt: Date | null;
    public comments: string | null;

    constructor(props: AbsenceProps_Core) {
        this.id = props.id;
        this.employeId = props.employeId;
        this.type = props.type;
        this.status = props.status;
        this.startDateTime = props.startDateTime;
        this.endDateTime = props.endDateTime;
        this.isFullDay = props.isFullDay;
        this.validatedBy = props.validatedBy;
        this.validatedAt = props.validatedAt;
        this.comments = props.comments;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!this.employeId || this.employeId <= 0) {
            throw new ValidationError("L'absence doit être liée à un employé valide.");
        }

        if (!(this.startDateTime instanceof Date) || isNaN(this.startDateTime.getTime())) {
            throw new ValidationError("La date de début de l'absence est invalide.");
        }

        if (!(this.endDateTime instanceof Date) || isNaN(this.endDateTime.getTime())) {
            throw new ValidationError("La date de fin de l'absence est invalide.");
        }

        if (this.endDateTime < this.startDateTime) {
            throw new ValidationError("La date de fin doit être postérieure à la date de début.");
        }
    }
    // #endregion
}

/**
 * Absence_L1
 * Enrichissement : ajout des metadata (timestamps)
 * Utilisé après récupération de la DB sans jointures
 */
export class Absence_L1 extends Absence_Core {
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date | null;

    constructor(props: AbsenceProps_L1) {
        const { createdAt, updatedAt, deletedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }

    // #region Business Methods
    public getDurationInDays(): number {
        const diffMs = this.endDateTime.getTime() - this.startDateTime.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    public isPending(): boolean {
        return this.status === 'en_attente';
    }

    public isApproved(): boolean {
        return this.status === 'approuve';
    }

    public isRejected(): boolean {
        return this.status === 'refuse';
    }

    public isCancelled(): boolean {
        return this.status === 'annule';
    }
    // #endregion
}

/**
 * Absence
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'une absence
 */
export class Absence extends Absence_L1 {
    public employe: UserEmployee_Core;
    public validator: UserManager_Core | null;

    constructor(props: AbsenceProps) {
        const { employe, validator, ...propsL1 } = props;
        super({ ...propsL1 });

        this.employe = employe;
        this.validator = validator;
    }
}
