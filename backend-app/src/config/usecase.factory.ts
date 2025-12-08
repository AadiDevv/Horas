import { AuthUseCase, UserUseCase, TeamUseCase, TimesheetUseCase, ScheduleUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static userUseCase: UserUseCase | null;
    private static teamUseCase: TeamUseCase | null;
    private static timesheetUseCase: TimesheetUseCase | null;
    private static scheduleUseCase: ScheduleUseCase | null;

    public static getAuthUseCase(): AuthUseCase {
        if (!this.authUseCase) {
            const userRepo = infra.getUserRepo();
            this.authUseCase = new AuthUseCase(userRepo);
        }
        return this.authUseCase;
    }

    public static getUserUseCase(): UserUseCase {
        if (!this.userUseCase) {
            const userRepo = infra.getUserRepoAsIUser();
            const teamRepo = infra.getTeamRepo();
            this.userUseCase = new UserUseCase(userRepo, teamRepo);
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
            this.timesheetUseCase = new TimesheetUseCase(timesheetRepo);
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

    public static reset(): void {
        this.authUseCase = null;
        this.userUseCase = null;
        this.teamUseCase = null;
        this.timesheetUseCase = null;
        this.scheduleUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getUserUseCase: () => ApplicationFactory.getUserUseCase(),
    getTeamUseCase: () => ApplicationFactory.getTeamUseCase(),
    getTimesheetUseCase: () => ApplicationFactory.getTimesheetUseCase(),
    getScheduleUseCase: () => ApplicationFactory.getScheduleUseCase(),
    reset: () => ApplicationFactory.reset()
};