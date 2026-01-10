import { TimesheetProps_Core, TimesheetProps_L1 } from "@/domain/types/entitiyProps";

export const TIMESHEET_CORE_SELECT = {
    id: true,
    employeId: true,
    timestamp: true,
    clockin: true,
    status: true,
} as const satisfies Record<keyof TimesheetProps_Core, true>;

export const TIMESHEET_L1_SELECT = {
    ...TIMESHEET_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
} as const satisfies Record<keyof TimesheetProps_L1, true>;
