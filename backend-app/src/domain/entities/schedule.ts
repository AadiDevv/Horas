import { ScheduleProps } from "../types/entitiyProps";
import { ScheduleCreateDTO, ScheduleUpdateDTO, ScheduleReadDTO, ScheduleListItemDTO, ScheduleWithUsersDTO } from "@/application/DTOS";
import { ValidationError } from "../error/AppError";
import { User } from "./user";
import { Team } from "./team";

export class Schedule {
    public readonly id?: number;
    public name: string;
    public startHour: Date;
    public endHour: Date;
    public activeDays: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    public createdAt: Date;
    public updatedAt: Date;
    public managerId: number;

    // Relations
    public users?: User[];
    public usersCount?: number;
    public teams?: Team[] | {
        id: number;
        name: string;
    }[];

    constructor(props: ScheduleProps) {
        this.id = props.id;
        this.name = props.name;
        this.startHour = props.startHour;
        this.endHour = props.endHour;
        this.activeDays = props.activeDays;
        this.managerId = props.managerId
        this.createdAt = props.createdAt || new Date(Date.now());
        this.updatedAt = props.updatedAt || new Date(Date.now());
        this.users = props.users;
        this.usersCount = props.usersCount;
        this.teams = props.teams;

        this.validate();
    }

    // #region Factory Methods (DTO → Entité)
    /**
     * Crée une entité Schedule à partir d'un DTO de création
     * Utilisé lors de la création d'un nouveau schedule
     */
    public static fromCreateDTO(dto: ScheduleCreateDTO & { managerId: number }): Schedule {
        const props: ScheduleProps = {
            ...dto,
            startHour: Schedule.parseTimeString(dto.startHour),
            endHour: Schedule.parseTimeString(dto.endHour),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return new Schedule(props);
    }

    /**
     * Met à jour une entité Schedule existante avec les données d'un DTO de mise à jour
     * Retourne une nouvelle instance (immutabilité)
     */
    public updateFromDTO(dto: ScheduleUpdateDTO): Schedule {
        console.log(`dto avant cleaning : `, dto);
        const cleanDto = Object.fromEntries(
            Object.entries(dto).filter(([_, value]) => value !== undefined)
        );
        console.log(`dto après cleaning : `, cleanDto);
        const props: ScheduleProps = {
            ...this,
            ...cleanDto,
            startHour: dto.startHour ? Schedule.parseTimeString(dto.startHour) : this.startHour,
            endHour: dto.endHour ? Schedule.parseTimeString(dto.endHour) : this.endHour,
            updatedAt: new Date(),
        };
        console.log(`props : `, props);
        return new Schedule(props);
    }
    // #endregion

    // #region Conversion Methods (Entité → DTO)
    /**
     * Convertit l'entité en ScheduleReadDTO (détail complet)
     * Utilisé pour GET /schedules/:id
     */
    public toReadDTO(): ScheduleReadDTO {
        if (!this.id) {
            throw new ValidationError("Le schedule doit avoir un ID pour être converti en ScheduleReadDTO");
        }

        return {
            id: this.id,
            name: this.name,
            startHour: Schedule.formatTimeToString(this.startHour),
            endHour: Schedule.formatTimeToString(this.endHour),
            activeDays: this.activeDays,
            createdAt: this.createdAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            updatedAt: this.updatedAt.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }),
            usersCount: this.usersCount
        };
    }

    /**
     * Convertit l'entité en ScheduleListItemDTO (liste simplifiée)
     * Utilisé pour GET /schedules (liste)
     */
    public toListItemDTO(): ScheduleListItemDTO {
        if (!this.id) {
            throw new ValidationError("Le schedule doit avoir un ID pour être converti en ScheduleListItemDTO");
        }

        return {
            id: this.id,
            name: this.name,
            startHour: Schedule.formatTimeToString(this.startHour),
            endHour: Schedule.formatTimeToString(this.endHour),
            activeDays: this.activeDays,
            usersCount: this.usersCount || 0
        };
    }

    /**
     * Convertit l'entité en ScheduleWithUsersDTO (avec liste des utilisateurs)
     * Utilisé pour GET /schedules/:id?include=users
     */
    public toWithUsersDTO(): ScheduleWithUsersDTO {
        if (!this.id) {
            throw new ValidationError("Le schedule doit avoir un ID pour être converti en ScheduleWithUsersDTO");
        }

        return {
            ...this.toReadDTO(),
            users: this.users?.map(user => ({
                id: user.id!,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            })) || []
        };
    }
    // #endregion

    // #region Validation Methods
    /**
     * Valide les données du schedule
     * Peut être appelée avant la sauvegarde
     */
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
    /**
     * Retourne le nom d'affichage du schedule
     */
    public getDisplayName(): string {
        return this.name;
    }

    /**
     * Vérifie si le schedule est actif un jour donné
     * @param dayOfWeek - Jour de la semaine (1=Lundi, 7=Dimanche)
     */
    public isActiveOnDay(dayOfWeek: number): boolean {
        return this.activeDays.includes(dayOfWeek);
    }

    /**
     * Retourne la durée de travail en heures
     */
    public getWorkingHours(): number {
        const diffMs = this.endHour.getTime() - this.startHour.getTime();
        return diffMs / (1000 * 60 * 60); // Conversion en heures
    }

    /**
     * Retourne les jours actifs sous forme de texte
     */
    public getActiveDaysText(): string {
        const dayNames = ['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        return this.activeDays.map(day => dayNames[day]).join(', ');
    }
    // #endregion

    // #region Static Utility Methods
    /**
     * Parse une chaîne de temps "HH:mm" en objet Date
     */
    private static parseTimeString(timeString: string): Date {
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
    private static formatTimeToString(date: Date): string {
        return date.toTimeString().slice(0, 5); // "HH:mm"
    }
    // #endregion
}

