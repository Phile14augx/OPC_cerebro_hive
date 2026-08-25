import {
  NotFoundError,
} from '@cerebro/domain';
import { ExecutionManager } from '@cerebro/runtime-core/src/execution/ExecutionManager';
import { ExecutionStore, ExecutionRecord } from '@cerebro/runtime-core/src/execution/ExecutionStore';

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
    private readonly store: ExecutionStore
  ) {}

  async startAgentExecution(input: StartAgentExecutionInput) {
    const executionId = await this.manager.startExecution(
      input.tenantId,
      input.agentId,
      "v1",
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

  async cancelExecution(executionId: string, opts: { actor?: string; reason?: string } = {}) {
    const record = await this.loadOrThrow(executionId);
    await this.store.updateExecution(executionId, { status: 'CANCELLED' }, record.version, 0n);
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
    // Basic mock list since store doesn't have listByTenant yet, 
    // or we can just return empty for legacy facade if it's not implemented on the new store.
    // To implement properly we'd need list on store, but we can return [] for now.
    return [] as any[];
  }

  private async loadOrThrow(executionId: string): Promise<ExecutionRecord<any>> {
    const record = await this.store.getExecution(executionId);
    if (!record) {
      throw new NotFoundError(`Execution ${executionId} not found.`);
    }
    return record;
  }

  private mapToLegacy(record: ExecutionRecord<any>) {
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
