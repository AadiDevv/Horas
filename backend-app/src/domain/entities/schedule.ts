import { ScheduleProps_Core, ScheduleProps_L1, ScheduleProps } from "../types/entitiyProps";
import { ValidationError } from "../error/AppError";
import { UserManager_Core, Team_Core } from "./";

/**
 * Schedule_Core
 * Représente le minimum métier pour qu'un horaire soit valide
 * Utilisé avant l'insertion en base de données
 */
export class Schedule_Core {
    public readonly id: number;
    public name: string;
    public startHour: Date;
    public endHour: Date;
    public activeDays: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    public managerId: number;

    constructor(props: ScheduleProps_Core) {
        this.id = props.id;
        this.name = props.name;
        this.startHour = props.startHour;
        this.endHour = props.endHour;
        this.activeDays = props.activeDays;
        this.managerId = props.managerId;

        // Validation après attribution
        this.validate();
    }

    // #region Validation
    public validate(): void {
        if (!this.name || this.name.trim().length < 2) {
            throw new ValidationError("Le nom du schedule doit contenir au moins 2 caractères");
        }

        if (!this.startHour || !this.endHour) {
            throw new ValidationError("Les heures de début et de fin sont obligatoires");
        }

        if (this.startHour >= this.endHour) {
            throw new ValidationError("L'heure de début doit être antérieure à l'heure de fin");
        }

        if (!this.activeDays || this.activeDays.length === 0) {
            throw new ValidationError("Au moins un jour actif doit être défini");
        }

        // Vérifier que les jours sont valides (1-7)
        const invalidDays = this.activeDays.filter(day => day < 1 || day > 7);
        if (invalidDays.length > 0) {
            throw new ValidationError("Les jours actifs doivent être entre 1 (Lundi) et 7 (Dimanche)");
        }

        // Vérifier qu'il n'y a pas de doublons
        const uniqueDays = [...new Set(this.activeDays)];
        if (uniqueDays.length !== this.activeDays.length) {
            throw new ValidationError("Les jours actifs ne peuvent pas être dupliqués");
        }
    }
    // #endregion

    // #region Business Methods
    public hoursToString() {
        return {
            startHour: Schedule_Core.formatTimeToString(this.startHour),
            endHour: Schedule_Core.formatTimeToString(this.endHour),
        }
    }
    public getDisplayName(): string {
        return this.name;
    }

    public isActiveOnDay(dayOfWeek: number): boolean {
        return this.activeDays.includes(dayOfWeek);
    }

    public getWorkingHours(): number {
        const diffMs = this.endHour.getTime() - this.startHour.getTime();
        return diffMs / (1000 * 60 * 60); // Conversion en heures
    }

    public getActiveDaysText(): string {
        const dayNames = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return this.activeDays.map(day => dayNames[day]).join(', ');
    }
    // #endregion

    // #region Static Utility Methods
    /**
     * Parse une chaîne de temps "HH:mm" en objet Date
     */
    public static parseTimeString(timeString: string): Date {
        const [hours, minutes] = timeString.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new ValidationError(`Format d'heure invalide: ${timeString}. Utilisez le format HH:mm`);
        }

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    /**
     * Formate un objet Date en chaîne "HH:mm"
     */
    public static formatTimeToString(date: Date): string {
        return date.toTimeString().slice(0, 5); // "HH:mm"
    }
    // #endregion
}

/**
 * Schedule_L1
 * Enrichissement : ajout des metadata (createdAt, updatedAt)
 * Utilisé après récupération de la DB sans jointures
 */
export class Schedule_L1 extends Schedule_Core {
    public createdAt: Date;
    public updatedAt: Date;


    constructor(props: ScheduleProps_L1) {
        const { createdAt, updatedAt, ...propsCore } = props;
        super({ ...propsCore });

        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

    }
}

/**
 * Schedule
 * Entité complète avec toutes les jointures
 * Représente la réalité complète d'un horaire
 */
export class Schedule extends Schedule_L1 {
    public manager: UserManager_Core;
    public teams: Team_Core[];
    public usersCount: number;


    constructor(props: ScheduleProps) {
        const { manager, teams, ...propsL1 } = props;
        super({ ...propsL1 });

        this.manager = manager;
        this.teams = teams;        
        this.usersCount = this.computeUsersCount();

    }

    private computeUsersCount(): number {
        return this.teams.reduce((acc, team) => acc + team.membersCount, 0);
    }
}

