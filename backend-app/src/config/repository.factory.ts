import { IAuth } from "@/domain/interfaces";
import { prismaService } from "@/infrastructure/database/prisma.service";
import { UserRepository } from "@/infrastructure/database/repositories/"

class InfrastructureFactory {
    private static userRepository: IAuth | null;

    public static initializeDatabase(): void {
        prismaService.getInstance();
    }

    public static getUserRepository(): IAuth {
        if (!this.userRepository) {
            this.userRepository = new UserRepository()
        }
        return this.userRepository
    }
    public static async disconnect(): Promise<void> {
        await prismaService.disconnect();
        this.userRepository = null
    }


}
export const infra = {
    initDb: () => { InfrastructureFactory.initializeDatabase() },
    getUserRepo: () => (InfrastructureFactory.getUserRepository()),
    disconnect: () => { InfrastructureFactory.disconnect() }

}
