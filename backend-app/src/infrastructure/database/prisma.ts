import { PrismaClient } from '@prisma/client';
import { Logger } from '../../shared/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton Prisma Client pour éviter les multiples instances en développement
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Gestion propre de la déconnexion
process.on('beforeExit', async () => {
  Logger.info('Disconnecting Prisma Client...');
  await prisma.$disconnect();
});

export { prisma };
export default prisma;
