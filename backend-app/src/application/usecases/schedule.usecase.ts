import { ISchedule } from "@/domain/interfaces/schedule.interface";
import { Schedule } from "@/domain/entities/schedule";
import {
    ScheduleCreateDTO,
    ScheduleUpdateDTO,
    ScheduleReadDTO,
    ScheduleListItemDTO,
    ScheduleWithUsersDTO,
    ScheduleFilterDTO
} from "@/application/DTOS";
import { NotFoundError, ValidationError, ForbiddenError } from "@/domain/error/AppError";

export class ScheduleUseCase {
    constructor(private scheduleRepository: ISchedule) { }

    // #region Read Operations
    /**
     * Récupère tous les schedules avec filtres optionnels
     * Accessible par Admin uniquement
     */
    async getAllSchedules(filter?: ScheduleFilterDTO): Promise<ScheduleListItemDTO[]> {
        const schedules = await this.scheduleRepository.getAllSchedules(filter);
        return schedules.map(schedule => schedule.toListItemDTO());
    }

    /**
     * Récupère un schedule par son ID
     * Accessible par tous les utilisateurs authentifiés
     */
    async getSchedule_ById(id: number): Promise<ScheduleReadDTO> {
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        return schedule.toReadDTO();
    }

    /**
     * Récupère un schedule avec la liste des utilisateurs
     * Accessible par Admin et Manager uniquement
     */
    async getScheduleWithUsers(id: number): Promise<ScheduleWithUsersDTO> {
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }
        return schedule.toWithUsersDTO();
    }

    /**
     * Récupère les schedules d'un utilisateur spécifique
     * Accessible par l'utilisateur lui-même, son manager ou admin
     */
    async getSchedules_ByUserId(userId: number): Promise<ScheduleListItemDTO[]> {
        const schedules = await this.scheduleRepository.getSchedules_ByUserId(userId);
        return schedules.map(schedule => schedule.toListItemDTO());
    }

    /**
     * Récupère les schedules d'une équipe spécifique
     * Accessible par le manager de l'équipe ou admin
     */
    async getSchedules_ByTeamId(teamId: number): Promise<ScheduleListItemDTO[]> {
        const schedules = await this.scheduleRepository.getSchedules_ByTeamId(teamId);
        return schedules.map(schedule => schedule.toListItemDTO());
    }
    // #endregion

    // #region Create Operations
    /**
     * Crée un nouveau schedule
     * Accessible par Admin uniquement
     */
    async createSchedule(dto: ScheduleCreateDTO): Promise<ScheduleReadDTO> {
        // Validation des données
        this.validateScheduleData(dto);

        // Vérifier qu'un schedule avec le même nom n'existe pas déjà
        const existingSchedules = await this.scheduleRepository.getAllSchedules({ name: dto.name });
        if (existingSchedules.length > 0) {
            throw new ValidationError(`Un schedule avec le nom "${dto.name}" existe déjà`);
        }

        // Créer l'entité
        const schedule = Schedule.fromCreateDTO(dto);

        // Sauvegarder
        const createdSchedule = await this.scheduleRepository.createSchedule(schedule);

        return createdSchedule.toReadDTO();
    }
    // #endregion

    // #region Update Operations
    /**
     * Met à jour un schedule existant
     * Accessible par Admin uniquement
     */
    async updateSchedule_ById(id: number, dto: ScheduleUpdateDTO): Promise<ScheduleReadDTO> {
        // Vérifier que le schedule existe
        const existingSchedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!existingSchedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }

        // Validation des données si fournies
        if (dto.name || dto.startHour || dto.endHour || dto.activeDays) {
            const validationData = {
                name: dto.name ?? existingSchedule.name,
                startHour: dto.startHour ?? existingSchedule.startHour.toTimeString().slice(0, 5),
                endHour: dto.endHour ?? existingSchedule.endHour.toTimeString().slice(0, 5),
                activeDays: dto.activeDays ?? existingSchedule.activeDays
            };
            this.validateScheduleData(validationData);
        }

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

        return savedSchedule.toReadDTO();
    }
    // #endregion

    // #region Delete Operations
    /**
     * Supprime un schedule
     * Accessible par Admin uniquement
     * Vérifie qu'aucun utilisateur/équipe n'utilise ce schedule
     */
    async deleteSchedule_ById(id: number): Promise<void> {
        // Vérifier que le schedule existe
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }

        // Vérifier qu'il n'est pas en cours d'utilisation
        const isInUse = await this.scheduleRepository.isScheduleInUse(id);
        if (isInUse) {
            const usersCount = await this.scheduleRepository.getScheduleUsersCount(id);
            throw new ForbiddenError(
                `Impossible de supprimer ce schedule car il est utilisé par ${usersCount} utilisateur(s) ou équipe(s)`
            );
        }

        // Supprimer
        await this.scheduleRepository.deleteSchedule_ById(id);
    }
    // #endregion

    // #region Business Operations
    /**
     * Vérifie si un schedule peut être supprimé
     * Accessible par Admin uniquement
     */
    async canDeleteSchedule(id: number): Promise<{ canDelete: boolean; reason?: string; usersCount: number }> {
        const schedule = await this.scheduleRepository.getSchedule_ById(id);
        if (!schedule) {
            throw new NotFoundError(`Schedule avec l'ID ${id} non trouvé`);
        }

        const isInUse = await this.scheduleRepository.isScheduleInUse(id);
        const usersCount = await this.scheduleRepository.getScheduleUsersCount(id);

        if (isInUse) {
            return {
                canDelete: false,
                reason: `Ce schedule est utilisé par ${usersCount} utilisateur(s) ou équipe(s)`,
                usersCount
            };
        }

        return {
            canDelete: true,
            usersCount: 0
        };
    }
    // #endregion

    // #region Private Validation Methods
    /**
     * Valide les données d'un schedule
     */
    private validateScheduleData(data: ScheduleCreateDTO): void {
        if (!data.name || data.name.trim().length < 2) {
            throw new ValidationError("Le nom du schedule doit contenir au moins 2 caractères");
        }

        if (!data.startHour || !data.endHour) {
            throw new ValidationError("Les heures de début et de fin sont obligatoires");
        }

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
    // #endregion
}

