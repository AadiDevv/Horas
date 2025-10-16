import { AuthUseCase, TeamUseCase, TimesheetUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static teamUseCase: TeamUseCase | null;
    private static timesheetUseCase: TimesheetUseCase | null;

    public static getAuthUseCase(): AuthUseCase {
        if (!this.authUseCase) {
            const userRepo = infra.getUserRepo();
            this.authUseCase = new AuthUseCase(userRepo);
        }
        return this.authUseCase;
    }

    public static getTeamUseCase(): TeamUseCase {
        if (!this.teamUseCase) {
            const teamRepo = infra.getTeamRepo();
            this.teamUseCase = new TeamUseCase(teamRepo);
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

    public static reset(): void {
        this.authUseCase = null;
        this.teamUseCase = null;
        this.timesheetUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getTeamUseCase: () => ApplicationFactory.getTeamUseCase(),
    getTimesheetUseCase: () => ApplicationFactory.getTimesheetUseCase(),
    reset: () => ApplicationFactory.reset()
};