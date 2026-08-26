import { PrismaClient } from '../generated/client';
import { ExecutionStore, ExecutionRecord } from '@cerebro/runtime-core/src/execution/ExecutionStore';
import { OutboxMessage } from '@cerebro/runtime-core/src/execution/ExecutionOutbox';
import { ExecutionEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';
import { ExecutionSnapshot } from '@cerebro/runtime-contracts/src/snapshots/ExecutionSnapshot';
import { ExecutionCheckpoint } from '@cerebro/runtime-core/src/execution/ExecutionCheckpoint';
import { ExecutionState } from '@cerebro/runtime-core/src/execution/ExecutionStateMachine';

export class PrismaExecutionStore implements ExecutionStore {
  constructor(private readonly prisma: PrismaClient) {}

  async createExecution(execution: Omit<ExecutionRecord, 'version'>): Promise<ExecutionRecord> {
    const record = await this.prisma.agentExecution.create({
      data: {
        id: execution.id,
        agentId: execution.agentId,
        agentVersionId: execution.agentVersionId,
        tenantId: execution.tenantId,
        workspaceId: execution.workspaceId ? execution.workspaceId : undefined,
        correlationId: execution.correlationId,
        traceId: execution.traceId,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        metadata: execution.metadata ? (execution.metadata as any) : undefined,
        version: 1, // Start at version 1
      },
    });

    return {
      ...record,
      workspaceId: record.workspaceId || undefined,
      status: record.status as ExecutionState,
      completedAt: record.completedAt ?? undefined,
      metadata: record.metadata as any,
    };
  }

  async updateExecution(
    id: string,
    updates: Partial<Omit<ExecutionRecord, 'id' | 'version'>>,
    expectedVersion: number,
    fencingToken: bigint
  ): Promise<ExecutionRecord> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Verify fencing token matches the active lease
      const lease = await tx.agentExecutionLease.findUnique({ where: { executionId: id } });
      if (!lease || lease.fencingToken !== fencingToken) {
        throw new Error(`Fencing token mismatch for execution ${id}. The lease is held by another worker or has expired.`);
      }

      // 2. Perform optimistic update
      const result = await tx.agentExecution.updateMany({
        where: {
          id,
          version: expectedVersion, // Optimistic concurrency check
        },
        data: {
          ...updates,
          metadata: updates.metadata ? (updates.metadata as any) : undefined,
          version: {
            increment: 1,
          },
        },
      });

      if (result.count === 0) {
        // Check if it exists at all
        const exists = await tx.agentExecution.findUnique({ where: { id } });
        if (!exists) throw new Error(`Execution ${id} not found.`);
        throw new Error(`Optimistic concurrency failure: Execution ${id} was modified by another process.`);
      }

      // 3. Return the updated record
      const updated = await tx.agentExecution.findUnique({ where: { id } });
      return {
        id: updated!.id,
        agentId: updated!.agentId,
        agentVersionId: updated!.agentVersionId,
        tenantId: updated!.tenantId,
        workspaceId: updated!.workspaceId ? updated!.workspaceId : undefined,
        correlationId: updated!.correlationId,
        traceId: updated!.traceId,
        status: updated!.status as ExecutionState,
        version: updated!.version,
        startedAt: updated!.startedAt,
        completedAt: updated!.completedAt ?? undefined,
        metadata: updated!.metadata as any,
      };
    });
  }

  async commitTransition(transition: {
    executionId: string;
    expectedVersion: number;
    fencingToken: bigint;
    update: any;
    events: any[];
    outboxEntries?: any[];
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Validate unexpired lease + fencing token using DB time
      const lease = await tx.$queryRaw`
        SELECT "executionId" 
        FROM "AgentExecutionLease" 
        WHERE "executionId" = ${transition.executionId}::uuid
          AND "fencingToken" = ${transition.fencingToken}
          AND "expiresAt" > NOW()
        FOR UPDATE
      ` as any[];
      if (lease.length === 0) {
        throw new Error('Lease expired or fencing token mismatch');
      }

      // 2. Conditional execution version update
      if (Object.keys(transition.update).length > 0) {
        const updateResult = await tx.agentExecution.updateMany({
          where: { id: transition.executionId, version: transition.expectedVersion },
          data: {
            status: transition.update.status,
            completedAt: transition.update.completedAt,
            metadata: transition.update.metadata ?? undefined,
            version: transition.expectedVersion + 1
          }
        });
        if (updateResult.count === 0) {
          throw new Error('Execution version mismatch (Optimistic Concurrency Failure)');
        }
      }

      // 3. Insert events
      if (transition.events.length > 0) {
        await tx.agentExecutionEvent.createMany({
          data: transition.events.map((ev: any) => ({
            executionId: transition.executionId,
            sequence: BigInt(ev.sequence),
            type: ev.type,
            payload: ev.payload as any,
            occurredAt: ev.timestamp
          }))
        });
      }

      // 4. Insert outbox messages
      if (transition.outboxEntries && transition.outboxEntries.length > 0) {
        await tx.agentExecutionOutbox.createMany({
          data: transition.outboxEntries.map((entry: any) => ({
            executionId: transition.executionId,
            type: entry.type,
            payload: entry.payload as any,
            status: 'PENDING',
            deduplicationKey: entry.id
          }))
        });
      }
    });
  }

  async getExecution(id: string): Promise<ExecutionRecord | null> {
    const record = await this.prisma.agentExecution.findUnique({ where: { id } });
    if (!record) return null;

    return {
      id: record.id,
      agentId: record.agentId,
      agentVersionId: record.agentVersionId,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId ? record.workspaceId : undefined,
      correlationId: record.correlationId,
      traceId: record.traceId,
      status: record.status as ExecutionState,
      version: record.version,
      startedAt: record.startedAt,
      completedAt: record.completedAt ?? undefined,
      metadata: record.metadata as any,
    };
  }

  async appendEvents(
    executionId: string, 
    events: ExecutionEvent<unknown>[], 
    fencingToken: bigint,
    outboxEntries?: OutboxMessage[]
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Verify fencing token
      const lease = await tx.$queryRaw`
        SELECT "executionId" 
        FROM "AgentExecutionLease" 
        WHERE "executionId" = ${executionId}::uuid
          AND "fencingToken" = ${fencingToken}
          AND "expiresAt" > NOW()
        FOR UPDATE
      ` as any[];
      if (lease.length === 0) {
        throw new Error(`Fencing token mismatch or expired lease for execution ${executionId}.`);
      }

      // 2. Insert Events
      if (events.length > 0) {
        await tx.agentExecutionEvent.createMany({
          data: events.map(e => ({
            id: e.id,
            executionId: e.executionId,
            sequence: e.sequence,
            type: e.type,
            eventVersion: e.eventVersion,
            schemaVersion: e.schemaVersion,
            payload: e.payload as any,
            occurredAt: e.occurredAt,
          })),
        });
      }

      // 3. Insert Outbox entries if provided (Dual-write transaction)
      if (outboxEntries && outboxEntries.length > 0) {
        await tx.agentExecutionOutbox.createMany({
          data: outboxEntries.map(m => ({
            id: m.id,
            executionId,
            type: m.type,
            payload: m.payload as any,
            status: m.status
          }))
        });
      }
    });
  }

  async getEvents(executionId: string, afterSequence?: bigint): Promise<ExecutionEvent<unknown>[]> {
    const execution = await this.prisma.agentExecution.findUnique({ where: { id: executionId } });
    if (!execution) return [];

    const records = await this.prisma.agentExecutionEvent.findMany({
      where: {
        executionId,
        ...(afterSequence !== undefined ? { sequence: { gt: afterSequence } } : {}),
      },
      orderBy: {
        sequence: 'asc',
      },
    });

    return records.map(r => ({
      id: r.id,
      executionId: r.executionId,
      sequence: r.sequence,
      type: r.type as any,
      eventVersion: r.eventVersion,
      schemaVersion: r.schemaVersion,
      payload: r.payload as any,
      occurredAt: r.occurredAt,
      tenantId: execution.tenantId, // Accurate relation, no fallback
    }));
  }

  async saveSnapshot(snapshot: ExecutionSnapshot, fencingToken: bigint, hash: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const lease = await tx.$queryRaw`
        SELECT "executionId" 
        FROM "AgentExecutionLease" 
        WHERE "executionId" = ${snapshot.executionId}::uuid
          AND "fencingToken" = ${fencingToken}
          AND "expiresAt" > NOW()
        FOR UPDATE
      ` as any[];
      if (lease.length === 0) {
        throw new Error(`Fencing token mismatch or expired lease for execution ${snapshot.executionId}.`);
      }

      await tx.agentExecutionSnapshot.create({
        data: {
          id: snapshot.id,
          executionId: snapshot.executionId,
          sequence: snapshot.sequence,
          state: snapshot.state as any,
          createdAt: snapshot.createdAt,
        },
      });
    });
  }

  async getLatestSnapshot(executionId: string): Promise<ExecutionSnapshot | null> {
    const execution = await this.prisma.agentExecution.findUnique({ where: { id: executionId } });
    if (!execution) return null;

    const record = await this.prisma.agentExecutionSnapshot.findFirst({
      where: { executionId },
      orderBy: { sequence: 'desc' },
    });

    if (!record) return null;

    return {
      id: record.id,
      executionId: record.executionId,
      sequence: record.sequence,
      createdAt: record.createdAt,
      state: record.state as any,
      tenantId: execution.tenantId,
      aggregateVersion: Number(record.sequence),
    };
  }

  async saveCheckpoint(checkpoint: ExecutionCheckpoint, fencingToken: bigint): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const lease = await tx.$queryRaw`
        SELECT "executionId" 
        FROM "AgentExecutionLease" 
        WHERE "executionId" = ${checkpoint.executionId}::uuid
          AND "fencingToken" = ${fencingToken}
          AND "expiresAt" > NOW()
        FOR UPDATE
      ` as any[];
      if (lease.length === 0) {
        throw new Error(`Fencing token mismatch or expired lease for execution ${checkpoint.executionId}.`);
      }

      await tx.agentExecutionCheckpoint.create({
        data: {
          id: checkpoint.id,
          executionId: checkpoint.executionId,
          stepNumber: checkpoint.stepNumber,
          providerRequest: checkpoint.providerRequest as any,
          providerResponse: checkpoint.providerResponse as any,
          usage: checkpoint.usage as any,
          finishReason: checkpoint.finishReason,
          toolCalls: checkpoint.toolCalls as any,
          createdAt: checkpoint.createdAt,
        },
      });
    });
  }
}
