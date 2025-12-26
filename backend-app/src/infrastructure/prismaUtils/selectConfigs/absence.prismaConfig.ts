import { AbsenceProps_Core, AbsenceProps_L1 } from "@/domain/types/entitiyProps";

export const ABSENCE_CORE_SELECT = {
    id: true,
    employeId: true,
    type: true,
    status: true,
    startDateTime: true,
    endDateTime: true,
    isFullDay: true,
    validatedBy: true,
    validatedAt: true,
    comments: true,
} as const satisfies Record<keyof AbsenceProps_Core, true>;

export const ABSENCE_L1_SELECT = {
    ...ABSENCE_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const satisfies Record<keyof AbsenceProps_L1, true>;
