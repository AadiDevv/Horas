import { TimesheetStatus } from "@/domain/types";
import { TimesheetUpdateDTO, TimesheetReadDTO, TimesheetListItemDTO } from "@/application/DTOS";
import { ValidationError } from "../error/AppError";
import { User } from "./user";
import { TimesheetProps } from "../types/entitiyProps"; // Assure-toi que ce type existe et est bien typé

export class Timesheet {
    public readonly id?: number;
    public employeId: number;
    public date: Date;
    public hour: Date;
    public clockin: boolean;
    public status: TimesheetStatus;
    public createdAt: Date;
    public updatedAt: Date;

    public employe?: User;

    constructor(props: TimesheetProps) {
        this.id = props.id;
        this.employeId = props.employeId;
        this.date = props.date;
        this.hour = props.hour;
        this.clockin = props.clockin;
        this.status = props.status ?? 'normal';
        this.createdAt = props.createdAt ?? new Date(Date.now());
        this.updatedAt = props.updatedAt ?? new Date(Date.now());

        this.employe = props.employe;

        this.validate();
    }

    // #region Factory Methods (DTO → Entité)

    /**
     * Met à jour une entité Timesheet existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    static fromUpdateDTO(existing: Timesheet, dto: TimesheetUpdateDTO): Timesheet {
        return new Timesheet({
            ...existing,
            date: dto.date ? new Date(dto.date) : existing.date,
            hour: dto.hour ? new Date(dto.hour) : existing.hour,
            clockin: dto.clockin ?? existing.clockin,
            status: dto.status ?? existing.status,
            updatedAt: new Date(Date.now()),
        });
    }

    // #endregion

    // #region Transformation Methods (Entité → DTO)

    private toDateStrings() {
        return {
            date: this.date.toISOString().split("T")[0], // YYYY-MM-DD
            hour: this.hour.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }

    /**
     * Convertit l'entité en TimesheetReadDTO (détail complet)
     */
    toReadDTO(): TimesheetReadDTO {
        if (!this.id) throw new ValidationError("Le timesheet doit avoir un ID pour être converti en DTO");

        return {
            id: this.id,
            employeId: this.employeId,
            clockin: this.clockin,
            status: this.status,
            ...this.toDateStrings(),
            employe: this.employe ? {
                id: this.employe.id!,
                firstName: this.employe.firstName,
                lastName: this.employe.lastName,
                email: this.employe.email
            } : undefined,
        };
    }

    /**
     * Convertit l'entité en TimesheetListItemDTO (liste simplifiée)
     */
    toListItemDTO(): TimesheetListItemDTO {
        if (!this.id) throw new ValidationError("Le timesheet doit avoir un ID pour être converti en DTO");

        return {
            id: this.id,
            employeId: this.employeId,
            employelastName: this.employe ? `${this.employe.firstName} ${this.employe.lastName}` : "Employé inconnu",
            date: this.date.toISOString().split("T")[0],
            hour: this.hour.toISOString(),
            clockin: this.clockin,
            status: this.status,
        };
    }

    // #endregion

    // #region Validation
    validate(): void {
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

    // #region Business
    getDisplayDate(): string {
        return this.date.toLocaleDateString("fr-FR");
    }
    // #endregion
}
