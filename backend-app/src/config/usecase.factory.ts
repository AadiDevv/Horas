import {AuthUseCase} from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;

    public static getAuthUseCase(): AuthUseCase {
        if (!this.authUseCase) {
            const userRepo = infra.getUserRepo();
            this.authUseCase = new AuthUseCase(userRepo);

        }
        return this.authUseCase;
    }
    public static reset(): void {
        this.authUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    reset: () => ApplicationFactory.reset()
};