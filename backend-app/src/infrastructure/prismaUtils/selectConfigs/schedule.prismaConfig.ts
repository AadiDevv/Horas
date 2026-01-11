import { ScheduleProps_L1, ScheduleProps_Core, ScheduleProps } from "@/domain/types/entitiyProps";
import { TEAM_CORE_SELECT } from "./team.prismaConfig";
import { USER_MANAGER_CORE_SELECT } from "./user.prismaConfig";

// Exclure les champs calculés (non-Prisma)
type ScheduleProp_Prisma = Omit<ScheduleProps, 'usersCount'>;
type ScheduleProps_L1_Prisma = Omit<ScheduleProps_L1, 'usersCount'>;
type ScheduleProps_Core_Prisma = Omit<ScheduleProps_Core, 'usersCount'>;



export const SCHEDULE_CORE_SELECT = {
    id: true,
    name: true,
    startHour: true,
    endHour: true,
    activeDays: true,
    managerId: true,
} as const satisfies Record<keyof ScheduleProps_Core_Prisma, true>;


export const SCHEDULE_L1_SELECT = {
    ...SCHEDULE_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
} as const satisfies Record<keyof ScheduleProps_L1_Prisma, true>;


export const SCHEDULE_JOINT_SELECT = {
    ...SCHEDULE_L1_SELECT,
    teams: {
        select: {
            ...TEAM_CORE_SELECT,
        }
    },
    manager: {
        select: {
            ...USER_MANAGER_CORE_SELECT,
        }
    }
} as const satisfies Record<keyof ScheduleProp_Prisma, any>;