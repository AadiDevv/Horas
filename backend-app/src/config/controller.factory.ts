import { AuthController, TeamController } from "@/presentation/controllers";
import { app } from "./usecase.factory";

class ControllerFactory {
    private static authController: AuthController | null;
    private static teamController: TeamController | null;

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

    public static reset(): void {
        this.authController = null;
        this.teamController = null;
    }

}

export const controllers = {
    AuthController: () => (ControllerFactory.getAuthController()),
    TeamController: () => (ControllerFactory.getTeamController()),
    reset: () => (ControllerFactory.reset())
}