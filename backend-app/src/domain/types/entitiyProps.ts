import { Role, TimesheetStatus } from "./index";
import { Team, Schedule, User } from "../entities/";

//#region User hierarchy types
export namespace User_Props {
    // Data enrichment types
    type User_L1 = {
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date;
        deletedAt: Date | null;
    }

    type User_joints = {
        team: Team;
        manager: User;
        customSchedule: Schedule;
    }

    // Props Hierarchy
    export type UserProps = {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        hashedPassword: string;
        role: Role;
        isActive: boolean;
        teamId: number | null;
        managerId: number | null;
        customScheduleId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date;
        deletedAt: Date | null;
        team: Team;
        manager: User;
        customSchedule: Schedule;
    }

    // UserProps = UserProps_enriched2 + User_joints
    export type UserProps_enriched1 = Omit<UserProps, keyof User_joints>
    export type UserProps_Core = Omit<UserProps_enriched1, keyof User_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type UserProps = User_Props.UserProps;
export type UserProps_L1 = User_Props.UserProps_enriched1;
export type UserProps_Core = User_Props.UserProps_Core;
//#endregion

//#region Team hierarchy types
export namespace Team_Props {
    // Data enrichment types
    type Team_L1 = {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

    type Team_joints = {
        manager: User;
        schedule: Schedule;
        members: User[];
    }

    // Props Hierarchy
    export type TeamProps = {
        id: number;
        name: string;
        description: string;
        managerId: number;
        scheduleId: number | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        manager: User;
        schedule: Schedule;
        members: User[];
        membersCount: number; // Computed field
    }

    // TeamProps = TeamProps_enriched2 + Team_joints
    export type TeamProps_enriched1 = Omit<TeamProps, keyof Team_joints>
    export type TeamProps_Core = Omit<TeamProps_enriched1, keyof Team_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type TeamProps = Team_Props.TeamProps;
export type TeamProps_L1 = Team_Props.TeamProps_enriched1;
export type TeamProps_Core = Team_Props.TeamProps_Core;
//#endregion

//#region Schedule hierarchy types
export namespace Schedule_Props {
    // Data enrichment types
    type Schedule_L1 = {
        createdAt: Date;
        updatedAt: Date;
    }

    type Schedule_joints = {
        manager: User;
        teams: Team[];
    }

    // Props Hierarchy
    export type ScheduleProps = {
        id: number;
        name: string;
        startHour: Date;
        endHour: Date;
        activeDays: number[];
        managerId: number;
        createdAt: Date;
        updatedAt: Date;
        manager: User;
        teams: Team[];
        usersCount: number; // Computed field
    }

    // ScheduleProps = ScheduleProps_enriched2 + Schedule_joints
    export type ScheduleProps_enriched1 = Omit<ScheduleProps, keyof Schedule_joints>
    export type ScheduleProps_Core = Omit<ScheduleProps_enriched1, keyof Schedule_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type ScheduleProps = Schedule_Props.ScheduleProps;
export type ScheduleProps_L1 = Schedule_Props.ScheduleProps_enriched1;
export type ScheduleProps_Core = Schedule_Props.ScheduleProps_Core;
//#endregion

//#region Timesheet hierarchy types
export namespace Timesheet_Props {
    // Data enrichment types
    type Timesheet_L1 = {
        createdAt: Date;
        updatedAt: Date;
    }

    type Timesheet_joints = {
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

    // TimesheetProps = TimesheetProps_enriched1 + TimeSheet_joints
    export type TimesheetProps_enriched1 = Omit<TimesheetProps, keyof Timesheet_joints>
    export type TimesheetProps_Core = Omit<TimesheetProps_enriched1, keyof Timesheet_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type TimesheetProps = Timesheet_Props.TimesheetProps;
export type TimesheetProps_L1 = Timesheet_Props.TimesheetProps_enriched1;
export type TimesheetProps_Core = Timesheet_Props.TimesheetProps_Core;
//#endregion