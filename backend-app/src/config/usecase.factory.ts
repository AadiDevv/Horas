import { AuthUseCase, EquipeUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static equipeUseCase: EquipeUseCase | null;

    public static getAuthUseCase(): AuthUseCase {
        if (!this.authUseCase) {
            const userRepo = infra.getUserRepo();
            this.authUseCase = new AuthUseCase(userRepo);
        }
        return this.authUseCase;
    }

    public static getEquipeUseCase(): EquipeUseCase {
        if (!this.equipeUseCase) {
            const equipeRepo = infra.getEquipeRepo();
            this.equipeUseCase = new EquipeUseCase(equipeRepo);
        }
        return this.equipeUseCase;
    }

    public static reset(): void {
        this.authUseCase = null;
        this.equipeUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getEquipeUseCase: () => ApplicationFactory.getEquipeUseCase(),
    reset: () => ApplicationFactory.reset()
};