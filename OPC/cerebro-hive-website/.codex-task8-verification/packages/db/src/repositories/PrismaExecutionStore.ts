import { PrismaClient } from '../generated/client';
import { ExecutionStore, ExecutionRecord } from '@cerebro/runtime-core/src/execution/ExecutionStore';
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
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        metadata: execution.metadata ? (execution.metadata as any) : undefined,
        version: 1, // Start at version 1
        traceId: execution.id,
      },
    });

    return {
      ...record,
      status: record.status as ExecutionState,
      completedAt: record.completedAt ?? undefined,
      metadata: record.metadata as any,
    };
  }

  async updateExecution(
    id: string,
    updates: Partial<Omit<ExecutionRecord, 'id' | 'version'>>,
    expectedVersion: number
  ): Promise<ExecutionRecord> {
    const result = await this.prisma.agentExecution.updateMany({
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
      const exists = await this.prisma.agentExecution.findUnique({ where: { id } });
      if (!exists) throw new Error(`Execution ${id} not found.`);
      throw new Error(`Optimistic concurrency failure: Execution ${id} was modified by another process.`);
    }

    // Return the updated record
    return this.getExecution(id) as Promise<ExecutionRecord>;
  }

  async getExecution(id: string): Promise<ExecutionRecord | null> {
    const record = await this.prisma.agentExecution.findUnique({ where: { id } });
    if (!record) return null;

    return {
      id: record.id,
      agentId: record.agentId,
      agentVersionId: record.agentVersionId,
      status: record.status as ExecutionState,
      version: record.version,
      startedAt: record.startedAt,
      completedAt: record.completedAt ?? undefined,
      metadata: record.metadata as any,
    };
  }

  async appendEvents(executionId: string, events: ExecutionEvent<any>[]): Promise<void> {
    // Rely on Prisma's unique constraint on [executionId, sequence] to prevent conflicts
    await this.prisma.agentExecutionEvent.createMany({
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

  async getEvents(executionId: string, afterSequence?: bigint): Promise<ExecutionEvent<any>[]> {
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
      tenantId: (r as any).tenantId || 'default',
    }));
  }

  async saveSnapshot(snapshot: ExecutionSnapshot): Promise<void> {
    await this.prisma.agentExecutionSnapshot.create({
      data: {
        id: snapshot.id,
        executionId: snapshot.executionId,
        sequence: snapshot.sequence,
        state: snapshot.state as any,
        createdAt: snapshot.createdAt,
      },
    });
  }

  async getLatestSnapshot(executionId: string): Promise<ExecutionSnapshot | null> {
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
      tenantId: (record as any).tenantId || 'default',
      aggregateVersion: (record as any).aggregateVersion || Number(record.sequence),
    };
  }

  async saveCheckpoint(checkpoint: ExecutionCheckpoint): Promise<void> {
    await this.prisma.agentExecutionCheckpoint.create({
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
  }
}
