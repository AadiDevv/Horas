import { IAuth, ITeam } from "@/domain/interfaces";
import { prismaService } from "@/infrastructure/database/prisma.service";
import { UserRepository, TeamRepository } from "@/infrastructure/database/repositories/"

class InfrastructureFactory {
    private static userRepository: IAuth | null;
    private static teamRepository: ITeam | null;

    public static initializeDatabase(): void {
        prismaService.getInstance();
    }

    public static getUserRepository(): IAuth {
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
    getTeamRepo: () => (InfrastructureFactory.getTeamRepository()),
    disconnect: () => { InfrastructureFactory.disconnect() }

}
