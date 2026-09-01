import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Resolves the active database connection string with safe production, Vercel serverless,
 * and development fallbacks.
 *
 * In Vercel serverless environments (AWS Lambda), /var/task is strictly READ-ONLY.
 * SQLite requires write access for locking and journal files, so we route SQLite to
 * /tmp/dev.db and copy over the seeded database if present.
 */
export function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote PostgreSQL / MySQL / Supabase connection string is supplied, use it
  if (envUrl && envUrl.trim().length > 0 && !envUrl.startsWith('file:')) {
    return envUrl.trim();
  }

  // Detect Vercel serverless or Linux Lambda environment
  const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

  if (isVercel) {
    const tmpDbPath = '/tmp/dev.db';

    // If /tmp/dev.db doesn't exist yet in this container instance, copy the bundled seed DB
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve('./dev.db'),
      ];

      let copied = false;
      for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            copied = true;
            break;
          } catch (err) {
            console.error('[Prisma SQLite /tmp Copy Error]:', err);
          }
        }
      }

      if (!copied) {
        // Create empty file if no seed found
        try {
          fs.writeFileSync(tmpDbPath, '');
        } catch (e) {
          // ignore
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Local development path fallback
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return 'file:./dev.db';
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
