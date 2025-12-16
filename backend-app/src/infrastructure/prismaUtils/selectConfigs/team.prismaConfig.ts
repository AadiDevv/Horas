import { TeamProps_L1, TeamProps_Core } from "@/domain/types/entitiyProps";

// Exclure les champs calculés (non-Prisma)
type TeamProps_Core_Prisma = Omit<TeamProps_Core, 'membersCount'>;
type TeamProps_L1_Prisma = Omit<TeamProps_L1, 'membersCount'>;
type WithCount<T> = Record<keyof T, true> & {
    _count?: any;
};

export const TEAM_CORE_SELECT = {
    id: true,
    name: true,
    description: true,
    managerId: true,
    scheduleId: true,
    _count: {
        select: {
            members: true
        }
    }
} as const satisfies WithCount<TeamProps_Core_Prisma>;



export const TEAM_L1_SELECT = {
    ...TEAM_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const satisfies WithCount<TeamProps_L1_Prisma>;