import { ExecutionStore } from './ExecutionStore';
import { ExecutionReplayService } from './ExecutionReplayService';
import { ExecutionStateMachine, ExecutionState } from './ExecutionStateMachine';
import { ExecutionIdempotencyGuard } from './ExecutionIdempotency';
import { ExecutionEvent, ExecutionStartedEvent, LLMStartedEvent, LLMCompletedEvent, ToolRequestedEvent } from '@cerebro/runtime-contracts/src/events/ExecutionEvent';
import { ExecutionOutbox } from './ExecutionOutbox';
import { LLMProvider, ToolProvider } from '../plugins/CapabilityProvider';

// TODO: ExecutionStore.updateExecution/appendEvents require a fencingToken
// (see ADR-002-why-lease-fencing.md) to protect against a stale/zombie
// worker mutating execution state after its lease expired. ExecutionManager
// doesn't yet acquire a lease via ExecutionLeaseManager -- this placeholder
// unblocks the type signature without pretending real fencing exists.
// Wire a real lease-derived token here once ExecutionManager takes an
// ExecutionLeaseManager dependency.
const PLACEHOLDER_FENCING_TOKEN = 0n;

export class ExecutionManager {
  constructor(
    private readonly store: ExecutionStore,
    private readonly replayService: ExecutionReplayService,
    private readonly idempotencyGuard: ExecutionIdempotencyGuard,
    private readonly outbox: ExecutionOutbox,
    private readonly llmProvider: LLMProvider,
    private readonly toolProvider: ToolProvider,
  ) {}

  /**
   * Starts a new durable execution.
   */
  async startExecution(tenantId: string, agentId: string, agentVersionId: string, input: string): Promise<string> {
    const execution = await this.store.createExecution({
      id: crypto.randomUUID(),
      agentId,
      agentVersionId,
      status: 'CREATED',
      startedAt: new Date(),
    });

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

    await this.store.appendEvents(execution.id, [startEvent], PLACEHOLDER_FENCING_TOKEN);

    // Transition to QUEUED
    ExecutionStateMachine.validateTransition(execution.status, 'QUEUED');
    await this.store.updateExecution(execution.id, { status: 'QUEUED' }, execution.version, PLACEHOLDER_FENCING_TOKEN);

    // Queue for async processing
    await this.outbox.publish(execution.id, 'ResumeExecution', { sequence: 1n });

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

    // Transition to RUNNING
    if (execution.status !== 'RUNNING') {
      ExecutionStateMachine.validateTransition(execution.status, 'RUNNING');
      await this.store.updateExecution(executionId, { status: 'RUNNING' }, execution.version, PLACEHOLDER_FENCING_TOKEN);
    }

    const state = await this.replayService.replay(executionId);
    let nextSequence = state.sequence + 1n;

    // Execution Logic Loop
    // Here we'd hook into the LLMProvider and ToolProvider natively
    // For now, this demonstrates the transition structure
    
    // ... model invocation, event appending, status updating ...
  }
}
