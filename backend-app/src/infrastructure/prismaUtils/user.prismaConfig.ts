import { UserProps_L1, UserProps_Core } from "@/domain/types/entitiyProps";

export const USER_CORE_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    hashedPassword: true,
    role: true,
    isActive: true,
    teamId: true,
    managerId: true,
    customScheduleId: true,
} as const satisfies Record<keyof UserProps_Core, true>;

export const USER_L1_SELECT = {
    ...USER_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    deletedAt: true,
} as const satisfies Record<keyof UserProps_L1, true>;