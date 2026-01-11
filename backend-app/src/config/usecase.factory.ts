import { AuthUseCase, UserUseCase, TeamUseCase, TimesheetUseCase, ScheduleUseCase, AbsenceUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static userUseCase: UserUseCase | null;
    private static teamUseCase: TeamUseCase | null;
    private static timesheetUseCase: TimesheetUseCase | null;
    private static scheduleUseCase: ScheduleUseCase | null;
    private static absenceUseCase: AbsenceUseCase | null;

    public static getAuthUseCase(): AuthUseCase {
        if (!this.authUseCase) {
            const userRepo = infra.getUserRepo();
            this.authUseCase = new AuthUseCase(userRepo);
        }
        return this.authUseCase;
    }

    public static getUserUseCase(): UserUseCase {
        if (!this.userUseCase) {
            const userRepo = infra.getUserRepo();
            const teamRepo = infra.getTeamRepo();
            const scheduleRepo = infra.getScheduleRepo();
            this.userUseCase = new UserUseCase(userRepo, teamRepo, scheduleRepo);
        }
        return this.userUseCase;
    }

    public static getTeamUseCase(): TeamUseCase {
        if (!this.teamUseCase) {
            const teamRepo = infra.getTeamRepo();
            const scheduleRepo = infra.getScheduleRepo();
            this.teamUseCase = new TeamUseCase(teamRepo, scheduleRepo);
        }
        return this.teamUseCase;
    }

    public static getTimesheetUseCase(): TimesheetUseCase {
        if (!this.timesheetUseCase) {
            const timesheetRepo = infra.getTimesheetRepo();
            const userRepo = infra.getUserRepo();
            this.timesheetUseCase = new TimesheetUseCase(timesheetRepo, userRepo);
        }
        return this.timesheetUseCase;
    }

    public static getScheduleUseCase(): ScheduleUseCase {
        if (!this.scheduleUseCase) {
            const scheduleRepo = infra.getScheduleRepo();
            this.scheduleUseCase = new ScheduleUseCase(scheduleRepo);
        }
        return this.scheduleUseCase;
    }

    public static getAbsenceUseCase(): AbsenceUseCase {
        if (!this.absenceUseCase) {
            const absenceRepo = infra.getAbsenceRepo();
            const userRepo = infra.getUserRepo();
            this.absenceUseCase = new AbsenceUseCase(absenceRepo, userRepo);
        }
        return this.absenceUseCase;
    }

    public static reset(): void {
        this.authUseCase = null;
        this.userUseCase = null;
        this.teamUseCase = null;
        this.timesheetUseCase = null;
        this.scheduleUseCase = null;
        this.absenceUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getUserUseCase: () => ApplicationFactory.getUserUseCase(),
    getTeamUseCase: () => ApplicationFactory.getTeamUseCase(),
    getTimesheetUseCase: () => ApplicationFactory.getTimesheetUseCase(),
    getScheduleUseCase: () => ApplicationFactory.getScheduleUseCase(),
    getAbsenceUseCase: () => ApplicationFactory.getAbsenceUseCase(),
    reset: () => ApplicationFactory.reset()
};