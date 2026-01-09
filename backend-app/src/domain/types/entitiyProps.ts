import { Role, TimesheetStatus } from "./index";
import { User_Core, Team_Core, Schedule_Core , UserEmployee_Core, UserManager_Core} from "../entities/";

//#region User hierarchy types
export namespace User_Props {
    //#region private
    //CORE
    export type UserProps_Core = {

        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        hashedPassword: string;
        role: Role;
        isActive: boolean;
    }
    type UserEmployeePropsCore = UserProps_Core & {
        teamId: number | null; // null if the employee is not assigned to a team
        managerId: number;
        customScheduleId: number | null; // null if the employee is not assigned to a custom schedule
    }
    type UserManagerPropsCore = UserProps_Core 
    // ENRICHIMENT
    type User_L1 = {
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        deletedAt: Date | null;
    }
    // JOINTS
    type UserEmployee_joints = {
        team: Team_Core | null;
        manager: UserManager_Core;
        customSchedule: Schedule_Core | null;
    }
    type UserManager_joints = {
        employes: UserEmployee_Core[];
        managedTeams: Team_Core[];
    }
    //#endregion
    export type UserProps = Omit<
        UserProps_Core
        & User_L1,
        never> // Le Omit est juste pour faire du flattening, il fait rien d'autre

    export type UserEmployeeProps = Omit<
        UserEmployeePropsCore
        & User_L1
        & UserEmployee_joints,
        never> // Le Omit est juste pour faire du flattening, il fait rien d'autre

    export type UserManagerProps = Omit<
        UserManagerPropsCore
        & User_L1
        & UserManager_joints,
        never> // Le Omit est juste pour faire du flattening, il fait rien d'autre

    // UserProps = UserProps_enriched2 + User_joints
    export type UserProps_L1 = UserProps;

    export type UserEmployeeProps_L1 = Omit<UserEmployeeProps, keyof UserEmployee_joints>
    export type UserEmployeeProps_Core = Omit<UserEmployeeProps_L1, keyof User_L1>

    export type UserManagerProps_L1 = Omit<UserManagerProps, keyof UserManager_joints>
    export type UserManagerProps_Core = Omit<UserManagerProps_L1, keyof User_L1>

}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type UserProps_Core = User_Props.UserProps_Core
export type UserProps_L1 = User_Props.UserProps_L1;

export type UserManagerProps = User_Props.UserManagerProps;
export type UserManagerProps_L1 = User_Props.UserManagerProps_L1;
export type UserManagerProps_Core = User_Props.UserManagerProps_Core;

export type UserEmployeeProps = User_Props.UserEmployeeProps;
export type UserEmployeeProps_L1 = User_Props.UserEmployeeProps_L1;
export type UserEmployeeProps_Core = User_Props.UserEmployeeProps_Core;
//#endregion

//#region Team hierarchy types
export namespace Team_Props {
    // Data enrichment types
    type Team_Core = {
        id: number;
        name: string;
        description: string | null;
        managerId: number;
        scheduleId: number | null;
        membersCount: number; // Computed field
    }

    type Team_L1 = {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

    type Team_joints = {
        manager: UserManager_Core;
        schedule: Schedule_Core | null;
        members: UserEmployee_Core[] | null;
    }

    // Props Hierarchy
    export type TeamProps = Omit<
        Team_Core
        & Team_L1
        & Team_joints, never>

    // TeamProps = TeamProps_enriched1 + Team_joints
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
    type Schedule_Core = {
        id: number;
        name: string;
        startHour: Date;
        endHour: Date;
        activeDays: number[];
        managerId: number;
    }

    type Schedule_L1 = {
        createdAt: Date;
        updatedAt: Date;

    }

    type Schedule_joints = {
        manager: UserManager_Core;
        teams: Team_Core[];
    }

    // Props Hierarchy
    export type ScheduleProps = Omit<
        Schedule_Core
        & Schedule_L1
        & Schedule_joints, never>

    // ScheduleProps = ScheduleProps_enriched1 + Schedule_joints
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
    type Timesheet_Core = {
        id: number;
        employeId: number;
        timestamp: Date;
        clockin: boolean;
        status: TimesheetStatus;
    }

    type Timesheet_L1 = {
        createdAt: Date;
        updatedAt: Date;
    }

    type Timesheet_joints = {
        employe: UserEmployee_Core;
    }

    //Props Hierarchy
    export type TimesheetProps = Omit<
        Timesheet_Core
        & Timesheet_L1
        & Timesheet_joints, never>

    // TimesheetProps = TimesheetProps_enriched1 + Timesheet_joints
    export type TimesheetProps_enriched1 = Omit<TimesheetProps, keyof Timesheet_joints>
    export type TimesheetProps_Core = Omit<TimesheetProps_enriched1, keyof Timesheet_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type TimesheetProps = Timesheet_Props.TimesheetProps;
export type TimesheetProps_L1 = Timesheet_Props.TimesheetProps_enriched1;
export type TimesheetProps_Core = Timesheet_Props.TimesheetProps_Core;
//#endregion

//#region Absence hierarchy types
export namespace Absence_Props {
    // Data enrichment types
    type Absence_Core = {
        id: number;
        employeId: number;
        type: import("./index").AbsenceType;
        status: import("./index").AbsenceStatus;
        startDateTime: Date;
        endDateTime: Date;
        isFullDay: boolean;
        validatedBy: number | null;
        validatedAt: Date | null;
        comments: string | null;
    }

    type Absence_L1 = {
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }

    type Absence_joints = {
        employe: UserEmployee_Core;
        validator: UserManager_Core | null;
    }

    // Props Hierarchy
    export type AbsenceProps = Omit<
        Absence_Core
        & Absence_L1
        & Absence_joints, never>

    // AbsenceProps = AbsenceProps_enriched1 + Absence_joints
    export type AbsenceProps_enriched1 = Omit<AbsenceProps, keyof Absence_joints>
    export type AbsenceProps_Core = Omit<AbsenceProps_enriched1, keyof Absence_L1>
}

// Aliases top-level pour import direct ailleurs sans préfixe namespace
export type AbsenceProps = Absence_Props.AbsenceProps;
export type AbsenceProps_L1 = Absence_Props.AbsenceProps_enriched1;
export type AbsenceProps_Core = Absence_Props.AbsenceProps_Core;
//#endregion