import { TeamProps_L1, TeamProps_Core } from "@/domain/types/entitiyProps";

// Exclure les champs calculés (non-Prisma)
type TeamProps_Core_Prisma = Omit<TeamProps_Core, 'membersCount'>;
type TeamProps_L1_Prisma = Omit<TeamProps_L1, 'membersCount'>;

export const TEAM_CORE_SELECT = {
    id: true,
    name: true,
    description: true,
    managerId: true,
    scheduleId: true,
} as const satisfies Record<keyof TeamProps_Core_Prisma, true>;

export const TEAM_L1_SELECT = {
    ...TEAM_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const satisfies Record<keyof TeamProps_L1_Prisma, true>;