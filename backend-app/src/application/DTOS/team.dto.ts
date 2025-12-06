import {
    TeamProps_Core,
    TeamProps_L1,
    UserEmployeeProps_Core,
    UserManagerProps_Core,
    ScheduleProps_Core
} from "@/domain/types/entitiyProps";
import {ScheduleReadDTO_Core, UserEmployeeListItemDTO, UserReadEmployeeDTO_Core, UserReadManagerDTO_Core} from "@/application/DTOS"
// #region Create DTO
/**
 * DTO pour créer une équipe
 * Basé sur TeamProps_Core sans id ni membersCount (champ calculé)
 */
export type TeamCreateDTO = Omit<TeamProps_Core, 'id' | 'membersCount'>
// #endregion

// #region Update DTO
/**
 * DTO pour mettre à jour une équipe
 * Tous les champs sont optionnels pour permettre des updates partiels (PATCH)
 */
export interface TeamUpdateDTO {
    name?: string;
    description?: string;
    scheduleId?: number;
    managerId?: number;
}

export interface TeamAsignScheduleDTO {
    scheduleId: number;
}
// #endregion

// #region Read DTO
/**
 * DTO de retour pour une équipe (GET /teams/:id)
 * Basé sur TeamProps_L1 avec transformations Date → string + relations
 */
export type TeamReadDTO = Omit<Omit<TeamProps_L1, 'createdAt' | 'updatedAt' | 'deletedAt'> & {
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    manager: UserReadManagerDTO_Core;
    schedule: ScheduleReadDTO_Core | null;
},never>

/**
 * TeamReadDTO_L1 : TeamReadDTO sans les relations (manager, schedule)
 * Correspond à TeamProps_L1 avec transformations Date → string
 */
export type TeamReadDTO_L1 = Omit<Omit<TeamReadDTO, 'manager' | 'schedule'>, never>

/**
 * TeamReadDTO_Core : TeamReadDTO_L1 sans les timestamps
 * Correspond à TeamProps_Core (champs métier uniquement)
 */
export type TeamReadDTO_Core = Omit<Omit<TeamReadDTO_L1, 'createdAt' | 'updatedAt' | 'deletedAt'>, never>

/**
 * DTO pour une équipe avec la liste complète des membres
 * Utilisé pour GET /teams/:id?include=members
 */
export interface TeamWithMembersDTO extends TeamReadDTO {
    members: UserEmployeeListItemDTO;
}
// #endregion

// #region List DTO
/**
 * DTO pour la liste des équipes (version simplifiée)
 * Basé sur TeamProps_Core + champs Date transformés + managerName dénormalisé
 */
export type TeamListItemDTO = TeamProps_Core
/**
 * DTO pour filtrer les équipes (Query Params)
 * Utilisé dans GET /api/teams?managerId=X
 */
export interface TeamFilterDTO {
    managerId?: number;
}
// #endregion
