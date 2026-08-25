import { PrismaClient } from '../generated/client';
import { ExecutionLease, ExecutionLeaseManager } from '@cerebro/runtime-core/src/execution/ExecutionLeaseManager';

export class PrismaExecutionLeaseManager implements ExecutionLeaseManager {
  constructor(private readonly prisma: PrismaClient) {}

  async registerWorker(workerId: string, metadata: unknown): Promise<void> {
    await this.prisma.executionWorker.upsert({
      where: { id: workerId },
      update: { lastHeartbeatAt: new Date(), metadata: metadata as any },
      create: { id: workerId, lastHeartbeatAt: new Date(), metadata: metadata as any }
    });
  }

  async heartbeatWorker(workerId: string): Promise<void> {
    await this.prisma.executionWorker.update({
      where: { id: workerId },
      data: { lastHeartbeatAt: new Date() }
    });
  }

  async acquireLease(executionId: string, ownerId: string, durationMs: number): Promise<ExecutionLease | null> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationMs);

      // We attempt to either create a new lease OR overtake an expired one using upsert-like logic,
      // but Prisma's upsert doesn't cleanly handle "where expiresAt < now".
      // We will do it in a transaction.
      return await this.prisma.$transaction(async (tx) => {
        const existing = await tx.agentExecutionLease.findUnique({
          where: { executionId }
        });

        if (existing) {
          if (existing.ownerId === ownerId || existing.expiresAt < now) {
            // Steal or renew
            const isRenewal = existing.ownerId === ownerId && existing.expiresAt >= now;
            const updated = await tx.agentExecutionLease.update({
              where: {
                executionId,
                version: existing.version // optimistic concurrency
              },
              data: {
                ownerId,
                expiresAt,
                version: existing.version + 1,
                fencingToken: isRenewal ? existing.fencingToken : existing.fencingToken + 1n
              }
            });
            return {
              executionId: updated.executionId,
              ownerId: updated.ownerId,
              expiresAt: updated.expiresAt,
              fencingToken: updated.fencingToken
            };
          } else {
            // Actively held by someone else
            return null;
          }
        } else {
          // Create new lease
          const created = await tx.agentExecutionLease.create({
            data: {
              executionId,
              ownerId,
              expiresAt,
              version: 1,
              fencingToken: 1n
            }
          });
          return {
            executionId: created.executionId,
            ownerId: created.ownerId,
            expiresAt: created.expiresAt,
            fencingToken: created.fencingToken
          };
        }
      });
    } catch (err: any) {
      // Prisma error for Record to update not found (P2025) means optimistic concurrency failed
      if (err.code === 'P2025') return null;
      throw err;
    }
  }

  async renewLease(executionId: string, ownerId: string, currentFencingToken: bigint, durationMs: number): Promise<ExecutionLease | null> {
    try {
      const expiresAt = new Date(Date.now() + durationMs);
      // Prisma has no bigInt literal support in updateMany directly sometimes, but we can use where.
      const updated = await this.prisma.agentExecutionLease.updateMany({
        where: {
          executionId,
          ownerId,
          fencingToken: currentFencingToken
        },
        data: {
          expiresAt,
          version: { increment: 1 }
        }
      });

      if (updated.count === 0) return null;

      const lease = await this.prisma.agentExecutionLease.findUnique({
        where: { executionId }
      });
      if (!lease) return null;

      return {
        executionId: lease.executionId,
        ownerId: lease.ownerId,
        expiresAt: lease.expiresAt,
        fencingToken: lease.fencingToken
      };
    } catch (err) {
      return null;
    }
  }

  async releaseLease(executionId: string, ownerId: string): Promise<void> {
    await this.prisma.agentExecutionLease.updateMany({
      where: {
        executionId,
        ownerId
      },
      data: {
        expiresAt: new Date(0) // Expire immediately, keep monotonic fencing
      }
    });
  }
}
