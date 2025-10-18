import { IAuth, IUser, ITeam, ITimesheet } from "@/domain/interfaces";
import { prismaService } from "@/infrastructure/database/prisma.service";
import { UserRepository, TeamRepository, TimesheetRepository } from "@/infrastructure/database/repositories/"

class InfrastructureFactory {
    private static userRepository: UserRepository | null;
    private static teamRepository: ITeam | null;
    private static timesheetRepository: ITimesheet | null;

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

    public static getTimesheetRepository(): ITimesheet {
        if (!this.timesheetRepository) {
            this.timesheetRepository = new TimesheetRepository()
        }
        return this.timesheetRepository
    }

    public static async disconnect(): Promise<void> {
        await prismaService.disconnect();
        this.userRepository = null
        this.teamRepository = null
        this.timesheetRepository = null
    }


}
export const infra = {
    initDb: () => { InfrastructureFactory.initializeDatabase() },
    getUserRepo: () => (InfrastructureFactory.getUserRepository()),
    getUserRepoAsIUser: () => (InfrastructureFactory.getUserRepositoryAsIUser()),
    getTeamRepo: () => (InfrastructureFactory.getTeamRepository()),
    getTimesheetRepo: () => (InfrastructureFactory.getTimesheetRepository()),
    disconnect: () => { InfrastructureFactory.disconnect() }

}
