import {
    UserEmployeeProps_Core,
    TeamProps_Core,
    ScheduleProps_Core,
    ScheduleProps
} from "@/domain/types/entitiyProps";
import { TeamListItemDTO, UserReadManagerDTO_Core, UserReadEmployeeDTO_Core} from "@/application/DTOS"
// #region Create DTO
/**
 * DTO pour créer un schedule de travail
 * Les hours sont au format "HH:mm" (ex: "09:00", "17:30")
 * activeDays est un tableau de nombres représentant les jours (1=Lundi, 7=Dimanche)
 */
export type ScheduleCreateDTO = Omit< Omit<ScheduleProps_Core,'id' | 'startHour' | 'endHour' | 'managerId'> &{
    startHour: string; // Format: "HH:mm"
    endHour: string;   // Format: "HH:mm"
},never>
// #endregion

// #region Update DTO

    /**
     * DTO pour mettre à jour un schedule
     * Tous les champs sont optionnels (PATCH) pour flexibilité
     */
    export interface ScheduleUpdateDTO {
        name?: string;
        startHour?: string; // Format: "HH:mm"
        endHour?: string;   // Format: "HH:mm"
        activeDays?: number[];
    }

// #endregion

// #region Read DTO

    /**
     * DTO de retour pour un schedule (GET /schedules/:id)
     * Basé sur ScheduleProps avec transformations Date → string + relations
     *
     * Note: Omit<Omit<...>, never> aplatit le type pour IntelliSense (affiche toutes les props au hover)
     */
    export type ScheduleReadDTO = Omit<Omit<ScheduleProps, 'startHour' | 'endHour' | 'createdAt' | 'updatedAt' |'teams' | 'manager'> & {
        startHour: string;   // Date → string "HH:mm"
        endHour: string;     // Date → string "HH:mm"
        createdAt: string;   // Date → string ISO
        updatedAt: string;   // Date → string ISO
        usersCount: number;  // Champ calculé (non dans Props)
        manager: UserReadManagerDTO_Core;
        teams: TeamListItemDTO[]
    }, never>

    /**
     * ScheduleReadDTO_L1 : ScheduleReadDTO sans les relations (manager, teams)
     * Correspond à ScheduleProps_L1 avec transformations Date → string
     */
    export type ScheduleReadDTO_L1 = Omit<Omit<ScheduleReadDTO, 'manager' | 'teams' | 'usersCount'>, never>

    /**
     * ScheduleReadDTO_Core : ScheduleReadDTO_L1 sans les timestamps + usersCount
     * Correspond à ScheduleProps_Core avec transformations Date → string
     */
    export type ScheduleReadDTO_Core = Omit<Omit<ScheduleReadDTO_L1, 'createdAt' | 'updatedAt' | 'usersCount'>, never>

    /**
     * DTO pour un schedule avec la liste des users assignés
     * Utilisé pour GET /schedules/:id?include=users
     */
    export interface ScheduleWithUsersDTO extends ScheduleReadDTO {
        users: UserReadEmployeeDTO_Core[];
    }

// #endregion

// #region List DTO

    /**
     * DTO pour la liste des schedules (version simplifiée)
     * Format léger pour performance avec transformations Date → string
     */
    export type ScheduleListItemDTO = Omit<Omit<ScheduleProps_Core, 'startHour' | 'endHour'> & {
        startHour: string;   // Date → string "HH:mm"
        endHour: string;     // Date → string "HH:mm"
    }, never>

// #endregion

// #region Filter DTO
/**
 * DTO pour filtrer les schedules
 */
export interface ScheduleFilterDTO {
    name?: string;
    activeDays?: number[];
}
// #endregion
