import {
    UserEmployeeProps_Core,
    TeamProps_Core,
    ScheduleProps_Core,
    ScheduleProps
} from "@/domain/types/entitiyProps";
import {UserReadManagerCoreDTO, TeamListItemDTO, UserEmployeeListItemDTO} from "@/application/DTOS"
// #region Create DTO
/**
 * DTO pour créer un schedule de travail
 * Les hours sont au format "HH:mm" (ex: "09:00", "17:30")
 * activeDays est un tableau de nombres représentant les jours (1=Lundi, 7=Dimanche)
 */
export type ScheduleCreateDTO = Omit<ScheduleProps_Core,'id' | 'managerId'>
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
 * Basé sur ScheduleProps avec transformations Date → string
 * Les hours sont retournées au format "HH:mm"
 */
export type ScheduleReadDTO = Omit<Omit<ScheduleProps, 'startHour' | 'endHour' | 'createdAt' | 'updatedAt' |'teams' | 'manager'> & {
    startHour: string;   // Date → string "HH:mm"
    endHour: string;     // Date → string "HH:mm"
    createdAt: string;   // Date → string ISO
    updatedAt: string;   // Date → string ISO
    manager: UserReadManagerCoreDTO
    teams: TeamListItemDTO[]
}, never>

/**
 * DTO pour un schedule avec la liste des users assignés
 * Utilisé pour GET /schedules/:id?include=users
 */
export interface ScheduleWithUsersDTO extends ScheduleReadDTO {
    users: UserEmployeeListItemDTO;
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
},never>
export type ScheduleCoreDTO = Omit<Omit<ScheduleProps_Core, 'startHour' | 'endHour'> & {
    startHour: string;   // Date → string "HH:mm"
    endHour: string;     // Date → string "HH:mm"
},never>
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
