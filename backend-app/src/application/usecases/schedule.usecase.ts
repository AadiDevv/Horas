import { ISchedule } from "@/domain/interfaces/schedule.interface";
import { Schedule } from "@/domain/entities/schedule";
import {
    ScheduleCreateDTO,
    ScheduleUpdateDTO,
    ScheduleReadDTO,
    ScheduleListItemDTO,
    ScheduleWithUsersDTO,
    ScheduleFilterDTO,
    UserReadDTO
} from "@/application/DTOS";
import { NotFoundError, ValidationError, ForbiddenError } from "@/domain/error/AppError";

export class ScheduleUseCase {
    constructor(private scheduleRepository: ISchedule) { }

    // #region Read Operations
    /**
     * Récupère tous les schedules avec filtres optionnels
     * Accessible par Admin uniquement
     */
    async getAllSchedules(user: UserReadDTO,filter?: ScheduleFilterDTO): Promise<Schedule[]> {
        const where: any = {};
        // #region Filter
        if (filter?.name) {
            where.name = {
                contains: filter.name,
                mode: 'insensitive'
            };
        }

        if (filter?.activeDays && filter.activeDays.length > 0) {
            // Recherche les schedules qui contiennent au moins un des jours spécifiés
            where.activeDays = {
                hasSome: filter.activeDays
            };
        }
        // #endregion
        // #region Manager Filter
        if(user.role === 'manager') {
            where.managerId = user.id;
        }
        // #endregion
        return await this.scheduleRepository.getAllSchedules(where);
    }

    /**
     * Récupère un schedule par son ID
     * Accessible par tous les utilisateurs authentifiés
     */
    async getSchedule_ById(id: number): Promise<Schedule> {
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        return schedule;
    }

    /**
     * Récupère un schedule avec la liste des utilisateurs
     * Accessible par Admin et Manager uniquement
     */
    async getScheduleWithUsers(id: number): Promise<Schedule> {
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        return schedule;
    }

    /**
     * Récupère les schedules d'une équipe spécifique
     * Accessible par le manager de l'équipe ou admin
     */
    async getSchedules_ByTeamId(teamId: number): Promise<Schedule[]> {
        const schedules = await this.scheduleRepository.getSchedules_ByTeamId(teamId);
        return schedules;
    }
    // #endregion

    // #region Create Operations
    /**
     * Crée un nouveau schedule
     * Accessible par Admin uniquement
     */
    async createSchedule(dto: ScheduleCreateDTO, managerId: number): Promise<Schedule> {
        // Validation des données
        this.validateScheduleData(dto);

        // Vérifier qu'un schedule avec le même nom n'existe pas déjà
        const existingSchedules = await this.scheduleRepository.getAllSchedules({ name: dto.name });
        if (existingSchedules.length > 0) {
            throw new ValidationError(`Un schedule avec le nom "${dto.name}" existe déjà`);
        }

        // Créer l'entité
        const schedule = Schedule.fromCreateDTO({...dto, managerId});

        // Sauvegarder
        const createdSchedule = await this.scheduleRepository.createSchedule(schedule);

        return createdSchedule
    }
    // #endregion

    // #region Update Operations
    /**
     * Met à jour un schedule existant
     * Accessible par Admin uniquement
     */
    async updateSchedule_ById(id: number, dto: ScheduleUpdateDTO, user: UserReadDTO): Promise<Schedule> {
        

        // Vérifier que le schedule existe
        const existingSchedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!existingSchedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        if (user.role !== 'admin') {
            if(user.role === 'employe') throw new ForbiddenError("Vous n'avez pas les permissions nécessaires pour mettre à jour un schedule");
            else if (user.role !== 'manager') {
                if (existingSchedule.managerId!== user.id) throw new ForbiddenError("Vous essayez de mettre à jour un schedule qui ne vous appartient pas");
            }
        }
        // Validation des données si fournies
            this.validateScheduleUpdateData(dto);

        // Vérifier l'unicité du nom si modifié
        if (dto.name && dto.name !== existingSchedule.name) {
            const existingSchedules = await this.scheduleRepository.getAllSchedules({ name: dto.name });
            if (existingSchedules.length > 0) {
                throw new ValidationError(`Un schedule avec le nom "${dto.name}" existe déjà`);
            }
        }

        // Mettre à jour l'entité
        const updatedSchedule = existingSchedule.updateFromDTO(dto);

        // Sauvegarder
        const savedSchedule = await this.scheduleRepository.updateSchedule_ById(updatedSchedule);

        return savedSchedule;
    }
    // #endregion

    // #region Delete Operations
    /**
     * Supprime un schedule
     * Accessible par Admin uniquement
     * Vérifie qu'aucun utilisateur/équipe n'utilise ce schedule
     */
    async deleteSchedule_ById(id: number, user: UserReadDTO): Promise<void> {
        // Vérifier que le schedule existe
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        if (user.role !== 'admin') {
            if(user.role === 'employe') throw new ForbiddenError("Vous n'avez pas les permissions nécessaires pour supprimer un schedule");
            else if (user.role !== 'manager') {
                if (schedule.managerId!== user.id) throw new ForbiddenError("Vous essayez de supprimer un schedule qui ne vous appartient pas");
            }
        }
        // Vérifier qu'il n'est pas en cours d'utilisation
        const isInUseByTeams = schedule.teams? schedule.teams.length > 0 : false;
        const isInUseByUsers = await this.scheduleRepository.getScheduleUsersCount(id)
        if (isInUseByTeams || isInUseByUsers) {
            throw new ForbiddenError(
                `Impossible de supprimer ce schedule car il est utilisé par ${isInUseByTeams ? schedule.teams?.length : 0} équipe(s) ou ${isInUseByUsers ? isInUseByUsers : 0} utilisateur(s)`
            );
        }
        await this.scheduleRepository.deleteSchedule_ById(id);
    }
    // #endregion
    private validateScheduleData(data: ScheduleCreateDTO): void {
        this.validateScheduleFields({
            name: data.name,
            startHour: data.startHour,
            endHour: data.endHour,
            activeDays: data.activeDays
        });
    }

    /**
     * Valide les données d'un schedule (pour mise à jour)
     * Ne valide que les champs fournis
     */
    private validateScheduleUpdateData(data: ScheduleUpdateDTO): void {
        this.validateScheduleFields(data);
    }

    /**
     * Validation générique des champs de schedule
     * Valide uniquement les champs fournis (non-undefined)
     */
    private validateScheduleFields(data: Partial<ScheduleCreateDTO>): void {
        if(Object.entries(data).length === 0) throw new ValidationError("Aucun fourni pour la validation des champs du schedule");
        // Validation du nom (si fourni)
        if (data.name !== undefined) {
            if (!data.name || data.name.trim().length < 2) {
                throw new ValidationError("Le nom du schedule doit contenir au moins 2 caractères");
            }
        }

        // Validation des heures (si fournies)
        if (data.startHour !== undefined || data.endHour !== undefined) {
            if (data.startHour && data.endHour) {
                // Valider le format des heures
                const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                if (!timeRegex.test(data.startHour) || !timeRegex.test(data.endHour)) {
                    throw new ValidationError("Format d'heure invalide. Utilisez le format HH:mm");
                }

                // Valider que l'heure de début est antérieure à l'heure de fin
                const [startH, startM] = data.startHour.split(':').map(Number);
                const [endH, endM] = data.endHour.split(':').map(Number);
                const startMinutes = startH * 60 + startM;
                const endMinutes = endH * 60 + endM;

                if (startMinutes >= endMinutes) {
                    throw new ValidationError("L'heure de début doit être antérieure à l'heure de fin");
                }
            } else if (data.startHour || data.endHour) {
                throw new ValidationError("Les heures de début et de fin doivent être fournies ensemble");
            }
        }

        // Validation des jours actifs (si fournis)
        if (data.activeDays !== undefined) {
            if (!data.activeDays || data.activeDays.length === 0) {
                throw new ValidationError("Au moins un jour actif doit être défini");
            }

            // Vérifier que les jours sont valides (1-7)
            const invalidDays = data.activeDays.filter(day => day < 1 || day > 7);
            if (invalidDays.length > 0) {
                throw new ValidationError("Les jours actifs doivent être entre 1 (Lundi) et 7 (Dimanche)");
            }

            // Vérifier qu'il n'y a pas de doublons
            const uniqueDays = [...new Set(data.activeDays)];
            if (uniqueDays.length !== data.activeDays.length) {
                throw new ValidationError("Les jours actifs ne peuvent pas être dupliqués");
            }
        }
    }
    // #endregion
}

