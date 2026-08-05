import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@cerebro/db';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 7's generated client uses the WASM query compiler, which requires
// a driver adapter (no classic binary/library query engine fallback) --
// see https://pris.ly/d/driver-adapters. The adapter wraps a `pg.Pool` and
// connects lazily, so constructing it here is safe even when DATABASE_URL
// is unset (e.g. during a build/typecheck pass that never issues a query).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
