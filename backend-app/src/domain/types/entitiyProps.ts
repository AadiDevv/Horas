import { Role } from "./valueType";
import { User } from "../entities/user";
import { Team } from "../entities/team";
export type UserProps = {
    email: string,
    hashedPassword?: string,
    firstName: string,
    lastName: string,
    role: Role,
    isActive: boolean,

    createdAt?: Date,
    updatedAt?: Date,
    lastLoginAt?: Date,
    deletedAt?: Date,

    phone?: string,
    id?: number,
    team?: Team | {
        id: number;
        name?: string;
    };
    manager?: User | {
        id: number;
        firstName?: string;
        lastName?: string;
    };
    schedule?: {
        id: number;
        name?: string;
        startHour?: Date;
        endHour?: Date;
    };
}

export type TeamProps = {
    id?: number,
    name: string,
    description?: string,
    managerId: number,
    scheduleId?: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    manager?: User,
    members?: User[],
    membersCount?: number,
}

export type TimesheetStatus = 'normal' | 'delay' | 'absence' | 'incomplete';

export type ScheduleProps = {
    id?: number;
    name: string;
    startHour: Date;
    endHour: Date;
    activeDays: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    createdAt?: Date;
    updatedAt?: Date;
    users?: User[];
    usersCount?: number;
}

export interface TimesheetProps {
    id?: number;
    employeId: number;
    date: Date;
    hour: Date;
    clockin: boolean;
    status?: TimesheetStatus;
    createdAt?: Date;
    updatedAt?: Date;
    employe?: User;
}