import { AuthUseCase, TeamUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static teamUseCase: TeamUseCase | null;

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

    public static reset(): void {
        this.authUseCase = null;
        this.teamUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getTeamUseCase: () => ApplicationFactory.getTeamUseCase(),
    reset: () => ApplicationFactory.reset()
};