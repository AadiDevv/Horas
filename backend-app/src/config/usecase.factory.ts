import { AuthUseCase, UserUseCase, TeamUseCase } from "@/application/usecases";
import { infra } from "./repository.factory";

class ApplicationFactory {
    private static authUseCase: AuthUseCase | null;
    private static userUseCase: UserUseCase | null;
    private static teamUseCase: TeamUseCase | null;

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
            this.userUseCase = new UserUseCase(userRepo);
        }
        return this.userUseCase;
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
        this.userUseCase = null;
        this.teamUseCase = null;
    }
}
export const app = {
    getAuthUseCase: () => ApplicationFactory.getAuthUseCase(),
    getUserUseCase: () => ApplicationFactory.getUserUseCase(),
    getTeamUseCase: () => ApplicationFactory.getTeamUseCase(),
    reset: () => ApplicationFactory.reset()
};