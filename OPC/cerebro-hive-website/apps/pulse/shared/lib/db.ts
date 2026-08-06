/**
 * HivePulse — Prisma client singleton
 * Reuses the workspace-level client from @cerebro/db so we share
 * the single connection pool with platform-api when co-located.
 */
export { prisma } from '@cerebro/db';
