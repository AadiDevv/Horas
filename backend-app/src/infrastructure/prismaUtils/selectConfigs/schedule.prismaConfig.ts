import { ScheduleProps_L1, ScheduleProps_Core } from "@/domain/types/entitiyProps";

// Exclure les champs calculés (non-Prisma)
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