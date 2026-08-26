import { NotFoundError } from '@cerebro/domain';
import { ExecutionManager } from '@cerebro/runtime-core/src/execution/ExecutionManager';
import { ExecutionStore, ExecutionRecord } from '@cerebro/runtime-core/src/execution/ExecutionStore';
import { PrismaClient } from '@cerebro/db';

export interface StartAgentExecutionInput {
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly traceId: string;
  readonly correlationId: string;
  readonly agentId: string;
  readonly message: string;
}

export class LegacyRuntimeCompatibilityService {
  constructor(
    private readonly manager: ExecutionManager,
    private readonly store: ExecutionStore,
    private readonly prisma: PrismaClient
  ) {}

  async startAgentExecution(input: StartAgentExecutionInput) {
    const version = await this.prisma.agentVersion.findFirst({
      where: { agentId: input.agentId },
      orderBy: { createdAt: 'desc' }
    });
    const versionId = version ? version.id : "00000000-0000-0000-0000-000000000000";

    const executionId = await this.manager.startExecution(
      input.tenantId,
      input.agentId,
      versionId,
      input.message
    );
    return this.getExecution(executionId);
  }

  async pauseExecution(_executionId: string): Promise<never> {
    throw new PauseNotSupportedError();
  }

  async resumeExecution(executionId: string) {
    await this.manager.resumeExecution(executionId, 1n);
    return this.getExecution(executionId);
  }

  async cancelExecution(executionId: string, _opts: { actor?: string; reason?: string } = {}) {
    const record = await this.loadOrThrow(executionId);
    
    // Acquire lease temporarily for cancellation
    const workerId = "legacy-cancellation-worker";
    await this.prisma.executionWorker.upsert({
      where: { id: workerId },
      update: { lastHeartbeatAt: new Date(), metadata: {} },
      create: { id: workerId, lastHeartbeatAt: new Date(), metadata: {} }
    });
    
    // Using a raw query to steal the lease for cancellation
    const updated = await this.prisma.$queryRaw`
      UPDATE "AgentExecutionLease"
      SET "ownerId" = ${workerId}::uuid,
          "expiresAt" = NOW() + '1 minute'::interval,
          "version" = "version" + 1,
          "fencingToken" = "fencingToken" + 1
      WHERE "executionId" = ${executionId}::uuid
      RETURNING "fencingToken"
    ` as unknown[];

    if (updated.length === 0) {
      throw new Error(`Could not acquire lease to cancel execution ${executionId}`);
    }

    const token = BigInt(updated[0].fencingToken);
    
    await this.store.updateExecution(executionId, { status: 'CANCELLED' }, record.version, token);
    return this.getExecution(executionId);
  }

  async getExecution(executionId: string) {
    const record = await this.loadOrThrow(executionId);
    return this.mapToLegacy(record);
  }

  async listExecutions(
    tenantId: string,
    opts: { status?: string; limit?: number } = {}
  ) {
    const records = await this.prisma.agentExecution.findMany({
      where: {
        tenantId,
        ...(opts.status ? { status: opts.status } : {})
      },
      orderBy: { startedAt: 'desc' },
      take: opts.limit || 50
    });
    
    return records.map(r => this.mapToLegacy({
      id: r.id,
      agentId: r.agentId,
      agentVersionId: r.agentVersionId,
      tenantId: r.tenantId,
      workspaceId: r.workspaceId ?? undefined,
      correlationId: r.correlationId,
      traceId: r.traceId,
      status: r.status as unknown as import('@cerebro/runtime-core/src/execution/ExecutionStateMachine').ExecutionState,
      version: r.version,
      startedAt: r.startedAt,
      completedAt: r.completedAt ?? undefined,
      metadata: r.metadata as Record<string, unknown>
    }));
  }

  private async loadOrThrow(executionId: string): Promise<ExecutionRecord<Record<string, unknown>>> {
    const record = await this.store.getExecution(executionId);
    if (!record) {
      throw new NotFoundError(`Execution ${executionId} not found.`);
    }
    return record;
  }

  private mapToLegacy(record: ExecutionRecord<Record<string, unknown>>) {
    return {
      id: record.id,
      kind: 'Agent',
      status: record.status,
      startedAt: record.startedAt,
      createdAt: record.startedAt,
      transitionHistory: [],
      metadata: record.metadata
    };
  }
}

export class PauseNotSupportedError extends Error {
  constructor() {
    super("Pausing a running Execution is not supported.");
    this.name = 'PauseNotSupportedError';
  }
}
