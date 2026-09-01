import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Resolves the active database connection string with safe production, Vercel serverless,
 * and development fallbacks.
 */
export function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  if (envUrl && envUrl.trim().length > 0 && !envUrl.startsWith('file:')) {
    return envUrl.trim();
  }

  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isVercel) {
    const tmpDbPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve('./dev.db'),
      ];

      for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (err) {
            console.error('[Prisma SQLite /tmp Copy Error]:', err);
          }
        }
      }
    }
    return `file:${tmpDbPath}`;
  }

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return 'file:./dev.db';
}

const resolvedDbUrl = resolveDatabaseUrl();
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = resolvedDbUrl;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
