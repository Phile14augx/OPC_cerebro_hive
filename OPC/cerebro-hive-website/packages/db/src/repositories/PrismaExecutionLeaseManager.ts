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
      return await this.prisma.$transaction(async (tx) => {
        // Lock row and use DB time
        const existing: any[] = await tx.$queryRaw`
          SELECT "executionId", "ownerId", "expiresAt", "version", "fencingToken"
          FROM "AgentExecutionLease"
          WHERE "executionId" = ${executionId}::uuid
          FOR UPDATE
        `;

        if (existing.length > 0) {
          const row = existing[0];
          // Check expiry against DB NOW()
          const check: any[] = await tx.$queryRaw`SELECT NOW() as now`;
          const dbNow = check[0].now;

          if (row.ownerId === ownerId || row.expiresAt < dbNow) {
            const isRenewal = row.ownerId === ownerId && row.expiresAt >= dbNow;
            const updated = await tx.$queryRaw`
              UPDATE "AgentExecutionLease"
              SET "ownerId" = ${ownerId}::uuid,
                  "expiresAt" = NOW() + (${durationMs}::text || ' milliseconds')::interval,
                  "version" = "version" + 1,
                  "fencingToken" = ${isRenewal ? row.fencingToken : row.fencingToken + 1n}
              WHERE "executionId" = ${executionId}::uuid AND "version" = ${row.version}
              RETURNING "executionId", "ownerId", "expiresAt", "fencingToken"
            ` as any[];
            if (updated.length === 0) return null;
            return {
              executionId: updated[0].executionId,
              ownerId: updated[0].ownerId,
              expiresAt: updated[0].expiresAt,
              fencingToken: updated[0].fencingToken
            };
          } else {
            return null;
          }
        } else {
          const created = await tx.$queryRaw`
            INSERT INTO "AgentExecutionLease" ("executionId", "ownerId", "expiresAt", "version", "fencingToken")
            VALUES (${executionId}::uuid, ${ownerId}::uuid, NOW() + (${durationMs}::text || ' milliseconds')::interval, 1, 1)
            RETURNING "executionId", "ownerId", "expiresAt", "fencingToken"
          ` as any[];
          return {
            executionId: created[0].executionId,
            ownerId: created[0].ownerId,
            expiresAt: created[0].expiresAt,
            fencingToken: created[0].fencingToken
          };
        }
      });
    } catch (err: any) {
      return null;
    }
  }

  async renewLease(executionId: string, ownerId: string, currentFencingToken: bigint, durationMs: number): Promise<ExecutionLease | null> {
    try {
      const updated = await this.prisma.$queryRaw`
        UPDATE "AgentExecutionLease"
        SET "expiresAt" = NOW() + (${durationMs}::text || ' milliseconds')::interval,
            "version" = "version" + 1
        WHERE "executionId" = ${executionId}::uuid
          AND "ownerId" = ${ownerId}::uuid
          AND "fencingToken" = ${currentFencingToken}
        RETURNING "executionId", "ownerId", "expiresAt", "fencingToken"
      ` as any[];

      if (updated.length === 0) return null;

      return {
        executionId: updated[0].executionId,
        ownerId: updated[0].ownerId,
        expiresAt: updated[0].expiresAt,
        fencingToken: updated[0].fencingToken
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
