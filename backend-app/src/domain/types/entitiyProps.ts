import { Role, TimesheetStatus } from "./index";
import { Team, Schedule, User } from "../entities/";
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
    customSchedule?: {
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
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    manager?: User,
    members?: User[],
    schedule?: Schedule,
    membersCount?: number,
}


export type ScheduleProps = {
    id?: number;
    name: string;
    startHour: Date;
    endHour: Date;
    activeDays: number[]; // [1, 2, 3, 4, 5] pour Lun-Ven
    managerId: number
    createdAt?: Date;
    updatedAt?: Date;
    users?: User[];
    usersCount?: number;
    teams?: Team[] | {
        id: number;
        name: string;
    }[];
}

// Timesheet hierarchy types
export namespace Timesheet_Props {
    // Data enrichment types
    type TimeSheet_dataEnrichment = {
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }

    type TimeSheet_joints = {
        employe: User;
    }
    //Props Hierarchy
    export type TimesheetProps = {
        id: number;
        employeId: number;
        date: Date;
        hour: Date;
        clockin: boolean;
        status: TimesheetStatus;
        createdAt: Date;
        updatedAt: Date;
        employe: User;
    }
    export type TimesheetProps_NoJoint = Omit<TimesheetProps, keyof TimeSheet_joints>
    export type TimesheetProps_Core = Omit<TimesheetProps_NoJoint, keyof TimeSheet_dataEnrichment>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type TimesheetProps = Timesheet_Props.TimesheetProps;
export type TimesheetProps_NoJoint = Timesheet_Props.TimesheetProps_NoJoint;
export type TimesheetProps_Core = Timesheet_Props.TimesheetProps_Core;
