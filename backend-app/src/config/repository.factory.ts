import { IAuth, IEquipe } from "@/domain/interfaces";
import { prismaService } from "@/infrastructure/database/prisma.service";
import { UserRepository, EquipeRepository } from "@/infrastructure/database/repositories/"

class InfrastructureFactory {
    private static userRepository: IAuth | null;
    private static equipeRepository: IEquipe | null;

    public static initializeDatabase(): void {
        prismaService.getInstance();
    }

    public static getUserRepository(): IAuth {
        if (!this.userRepository) {
            this.userRepository = new UserRepository()
        }
        return this.userRepository
    }

    public static getEquipeRepository(): IEquipe {
        if (!this.equipeRepository) {
            this.equipeRepository = new EquipeRepository()
        }
        return this.equipeRepository
    }

    public static async disconnect(): Promise<void> {
        await prismaService.disconnect();
        this.userRepository = null
        this.equipeRepository = null
    }


}
export const infra = {
    initDb: () => { InfrastructureFactory.initializeDatabase() },
    getUserRepo: () => (InfrastructureFactory.getUserRepository()),
    getEquipeRepo: () => (InfrastructureFactory.getEquipeRepository()),
    disconnect: () => { InfrastructureFactory.disconnect() }

}
