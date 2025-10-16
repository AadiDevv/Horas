import { AuthController, EquipeController } from "@/presentation/controllers";
import { app } from "./usecase.factory";

class ControllerFactory {
    private static authController: AuthController | null;
    private static equipeController: EquipeController | null;

    public static getAuthController(): AuthController {
        if (!this.authController) {
            const usecase = app.getAuthUseCase();
            this.authController = new AuthController(usecase);
        }
        return this.authController
    }

    public static getEquipeController(): EquipeController {
        if (!this.equipeController) {
            const usecase = app.getEquipeUseCase();
            this.equipeController = new EquipeController(usecase);
        }
        return this.equipeController
    }

    public static reset(): void {
        this.authController = null;
        this.equipeController = null;
    }

}

export const controllers = {
    AuthController: () => (ControllerFactory.getAuthController()),
    EquipeController: () => (ControllerFactory.getEquipeController()),
    reset: () => (ControllerFactory.reset())
}