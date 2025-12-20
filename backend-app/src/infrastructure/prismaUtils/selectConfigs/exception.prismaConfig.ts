import { ExceptionProps_Core, ExceptionProps_L1 } from "@/domain/types/entitiyProps";

export const EXCEPTION_CORE_SELECT = {
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
} as const satisfies Record<keyof ExceptionProps_Core, true>;

export const EXCEPTION_L1_SELECT = {
    ...EXCEPTION_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const satisfies Record<keyof ExceptionProps_L1, true>;
