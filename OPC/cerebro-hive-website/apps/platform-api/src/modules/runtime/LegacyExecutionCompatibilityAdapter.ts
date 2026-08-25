import { ExecutionRepository, Execution, ExecutionId } from '@cerebro/domain';
import { ExecutionRuntimeKernel } from '@cerebro/runtime-core/src/execution/kernel/ExecutionRuntimeKernel';
import { ExecutionStore } from '@cerebro/runtime-core/src/execution/ExecutionStore';

export class LegacyExecutionCompatibilityAdapter implements ExecutionRepository {
  constructor(
    private readonly kernel: ExecutionRuntimeKernel,
    private readonly store: ExecutionStore
  ) {}

  async save(execution: Execution, expectedVersion: number): Promise<void> {
    // Stubbed. Real operations go through kernel.
  }

  async load(id: ExecutionId): Promise<Execution | undefined> {
    const record = await this.store.getExecution(id.value);
    if (!record) return undefined;

    // Minimal mapping to let the legacy routes not crash before W0.4
    return Execution.create({
      kind: 'Agent',
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      traceId: record.traceId,
      userId: 'system'
    });
  }

  async loadTransitions(id: ExecutionId): Promise<any> {
    return [];
  }

  async findChildren(parentId: ExecutionId): Promise<Execution[]> {
    return [];
  }

  async exists(id: ExecutionId): Promise<boolean> {
    const record = await this.store.getExecution(id.value);
    return !!record;
  }

  async listByTenant(tenantId: string, opts?: any): Promise<readonly Execution[]> {
    return [];
  }
}
