// Singleton Prisma Client pour éviter les multiples instances en développement
import { PrismaClient } from '@prisma/client';


export class PrismaService {
  private static instance: PrismaClient;

  /**
   * Obtient l'instance singleton de PrismaClient
   */
  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? [
          {
            emit: 'event',
            level: 'query',
          },
          'error',
          'warn'
        ] : ['error'],
      });

      // Ajouter un listener pour voir les paramètres
      if (process.env.NODE_ENV === 'development') {
        (PrismaService.instance as any).$on('query', (e: any) => {
          console.log('🔍 Query:', e.query);
          console.log('📊 Params:', e.params);
          console.log('⏱️ Duration:', e.duration + 'ms');
          console.log('---');
        });
      }
    }
    return PrismaService.instance;
  }
  /**
   * Ferme la connexion à la base de données
   */
  public static async disconnect(): Promise<void> {
    if (PrismaService.instance) {
      await PrismaService.instance.$disconnect();
    }
  }

  /**
   * Vérifie la connexion à la base de données
   */
  public static async checkConnection(): Promise<boolean> {
    try {
      const prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Erreur de connexion à la base de données:', error);
      return false;
    }
  }
}

// Export de l'instance par défaut
export const prismaService = PrismaService;
export const prisma = PrismaService.getInstance();