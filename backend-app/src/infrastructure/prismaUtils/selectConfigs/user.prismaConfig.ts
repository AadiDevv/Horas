import {
    UserEmployeeProps_Core,
    UserEmployeeProps_L1,
    UserManagerProps_Core,
    UserManagerProps_L1
} from "@/domain/types/entitiyProps";

// Employee SELECT configs
export const USER_EMPLOYEE_CORE_SELECT = {
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
} as const satisfies Record<keyof UserEmployeeProps_Core, true>;

export const USER_EMPLOYEE_L1_SELECT = {
    ...USER_EMPLOYEE_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    deletedAt: true,
} as const satisfies Record<keyof UserEmployeeProps_L1, true>;

// Manager SELECT configs
export const USER_MANAGER_CORE_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    hashedPassword: true,
    role: true,
    isActive: true,
    
} as const satisfies Omit<Record<keyof UserManagerProps_Core, true>, 'teamIds' | 'employeeIds'>;

export const USER_MANAGER_L1_SELECT = {
    ...USER_MANAGER_CORE_SELECT,
    createdAt: true,
    updatedAt: true,
    lastLoginAt: true,
    deletedAt: true,
} as const satisfies Omit<Record<keyof UserManagerProps_L1, true>, 'teamIds' | 'employeeIds'>;