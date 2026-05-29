import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma client singleton to prevent multiple instances
let prisma: PrismaClient | undefined;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log errors
    prisma.$on('error', (e: any) => {
      logger.error('Prisma Error:', e.message);
    });

    // Log warnings
    prisma.$on('warn', (e: any) => {
      logger.warn('Prisma Warning:', e.message);
    });
  }

  return prisma;
};

export const prisma = getPrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});
