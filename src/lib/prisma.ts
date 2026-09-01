import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Resolves the active database connection string with safe production & development fallbacks.
 * Prevents Prisma from throwing "DATABASE_URL resolved to an empty string" during Vercel SSR/Builds.
 */
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // Safe local file fallback for development or serverless environments
  return "file:./dev.db";
}

const dbUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
