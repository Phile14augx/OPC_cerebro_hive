import { ExecutionStore } from './ExecutionStore';
import { ExecutionReplayService } from './ExecutionReplayService';
import { ExecutionStateMachine } from './ExecutionStateMachine';
import { ExecutionIdempotencyGuard } from './ExecutionIdempotency';
import { ExecutionStartedEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';
import { ExecutionOutbox } from './ExecutionOutbox';
import { ExecutionLeaseManager, ExecutionLease } from './ExecutionLeaseManager';
import { LLMProvider, ToolProvider } from '../plugins/CapabilityProvider';

export class ExecutionManager {
  private readonly workerId: string = "runtime-core-worker"; // In a real cluster, this would be node-specific

  constructor(
    private readonly store: ExecutionStore,
    private readonly replayService: ExecutionReplayService,
    private readonly idempotencyGuard: ExecutionIdempotencyGuard,
    private readonly leaseManager: ExecutionLeaseManager,
    private readonly outbox: ExecutionOutbox,
    private readonly llmProvider: LLMProvider,
    private readonly toolProvider: ToolProvider,
  ) {}

  /**
   * Starts a new durable execution.
   */
  async startExecution(tenantId: string, agentId: string, agentVersionId: string, input: string): Promise<string> {
    const executionId = crypto.randomUUID();
    const correlationId = crypto.randomUUID();
    
    // Create execution
    const execution = await this.store.createExecution({
      id: executionId,
      agentId,
      agentVersionId,
      tenantId,
      correlationId,
      traceId: executionId,
      status: 'CREATED',
      startedAt: new Date(),
    });

    // Acquire lease
    const lease = await this.leaseManager.acquireLease(execution.id, this.workerId, 30000);
    if (!lease) {
      throw new Error(`Failed to acquire initial lease for new execution ${execution.id}`);
    }

    const startEvent: ExecutionStartedEvent = {
      id: crypto.randomUUID(),
      executionId: execution.id,
      sequence: 1n,
      type: 'ExecutionStarted',
      occurredAt: new Date(),
      eventVersion: 1,
      schemaVersion: 1,
      tenantId,
      payload: {
        agentId,
        agentVersionId,
        context: { input },
      },
    };

    // Transition to QUEUED
    ExecutionStateMachine.validateTransition(execution.status, 'QUEUED');
    await this.store.updateExecution(execution.id, { status: 'QUEUED' }, execution.version, lease.fencingToken);

    // Queue for async processing and dual-write event
    const resumeCommand: import('./ExecutionOutbox').OutboxMessage = {
      id: crypto.randomUUID(),
      executionId: execution.id,
      type: 'ResumeExecution',
      payload: { sequence: "1" },
      status: 'PENDING',
      retries: 0
    };
    await this.store.appendEvents(execution.id, [startEvent], lease.fencingToken, [resumeCommand]);

    return execution.id;
  }

  /**
   * Resumes execution safely, pulling state from the event log and deciding the next action.
   */
  async resumeExecution(executionId: string, expectedSequence: bigint): Promise<void> {
    await this.idempotencyGuard.assertIdempotentResume(executionId, expectedSequence);

    const execution = await this.store.getExecution(executionId);
    if (!execution) throw new Error(`Execution ${executionId} not found`);

    if (ExecutionStateMachine.isTerminal(execution.status)) {
      return; // Already done
    }

    const lease = await this.leaseManager.acquireLease(executionId, this.workerId, 30000);
    if (!lease) {
      throw new Error(`Execution ${executionId} is currently leased by another worker.`);
    }

    // Transition to RUNNING
    if (execution.status !== 'RUNNING') {
      ExecutionStateMachine.validateTransition(execution.status, 'RUNNING');
      await this.store.updateExecution(executionId, { status: 'RUNNING' }, execution.version, lease.fencingToken);
    }

    const _state = await this.replayService.replay(executionId);
    // Sequence incremented here

    // Execution Logic Loop
    // Here we'd hook into the LLMProvider and ToolProvider natively
    // For now, this demonstrates the transition structure
  }
}
