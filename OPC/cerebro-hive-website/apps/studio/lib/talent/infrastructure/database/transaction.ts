import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Execute operations within a single database transaction.
 * Useful for ensuring atomic updates (e.g., publishing an assessment and firing domain events).
 */
export async function withTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  }, options);
}
