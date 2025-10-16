import { AuthController, TeamController, TimesheetController } from "@/presentation/controllers";
import { app } from "./usecase.factory";

class ControllerFactory {
    private static authController: AuthController | null;
    private static teamController: TeamController | null;
    private static timesheetController: TimesheetController | null;

    public static getAuthController(): AuthController {
        if (!this.authController) {
            const usecase = app.getAuthUseCase();
            this.authController = new AuthController(usecase);
        }
        return this.authController
    }

    public static getTeamController(): TeamController {
        if (!this.teamController) {
            const usecase = app.getTeamUseCase();
            this.teamController = new TeamController(usecase);
        }
        return this.teamController
    }

    public static getTimesheetController(): TimesheetController {
        if (!this.timesheetController) {
            const usecase = app.getTimesheetUseCase();
            this.timesheetController = new TimesheetController(usecase);
        }
        return this.timesheetController
    }

    public static reset(): void {
        this.authController = null;
        this.teamController = null;
        this.timesheetController = null;
    }

}

export const controllers = {
    AuthController: () => (ControllerFactory.getAuthController()),
    TeamController: () => (ControllerFactory.getTeamController()),
    TimesheetController: () => (ControllerFactory.getTimesheetController()),
    reset: () => (ControllerFactory.reset())
}