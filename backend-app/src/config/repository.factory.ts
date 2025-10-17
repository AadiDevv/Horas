import { IAuth, IUser, ITeam } from "@/domain/interfaces";
import { prismaService } from "@/infrastructure/database/prisma.service";
import { UserRepository, TeamRepository } from "@/infrastructure/database/repositories/"

class InfrastructureFactory {
    private static userRepository: UserRepository | null;
    private static teamRepository: ITeam | null;

    public static initializeDatabase(): void {
        prismaService.getInstance();
    }

    /**
     * Retourne le UserRepository en tant qu'IAuth (pour AuthUseCase)
     */
    public static getUserRepository(): IAuth {
        if (!this.userRepository) {
            this.userRepository = new UserRepository()
        }
        return this.userRepository
    }

    /**
     * Retourne le UserRepository en tant qu'IUser (pour UserUseCase)
     */
    public static getUserRepositoryAsIUser(): IUser {
        if (!this.userRepository) {
            this.userRepository = new UserRepository()
        }
        return this.userRepository
    }

    public static getTeamRepository(): ITeam {
        if (!this.teamRepository) {
            this.teamRepository = new TeamRepository()
        }
        return this.teamRepository
    }

    public static async disconnect(): Promise<void> {
        await prismaService.disconnect();
        this.userRepository = null
        this.teamRepository = null
    }


}
export const infra = {
    initDb: () => { InfrastructureFactory.initializeDatabase() },
    getUserRepo: () => (InfrastructureFactory.getUserRepository()),
    getUserRepoAsIUser: () => (InfrastructureFactory.getUserRepositoryAsIUser()),
    getTeamRepo: () => (InfrastructureFactory.getTeamRepository()),
    disconnect: () => { InfrastructureFactory.disconnect() }

}
