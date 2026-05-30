import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma client singleton to prevent multiple instances
let _prisma: PrismaClient | undefined;

export const getPrismaClient = (): PrismaClient => {
  if (!_prisma) {
    _prisma = new PrismaClient({
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
      _prisma.$on('query', (e: any) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    // Log errors
    _prisma.$on('error', (e: any) => {
      logger.error('Prisma Error:', e.message);
    });

    // Log warnings
    _prisma.$on('warn', (e: any) => {
      logger.warn('Prisma Warning:', e.message);
    });
  }

  return _prisma;
};

export const prisma = getPrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await __prisma.$disconnect();
  logger.info('Database connection closed');
});
