import { DomainEvent } from '../events/DomainEvent';
import { ITransactionContext } from '../transactions/UnitOfWork';
import { ExecutionEventSink } from './ExecutionOrchestrator';
import { ExecutionEventOutboxStore } from './ExecutionEventOutbox';
import { toExecutionIntegrationEvent } from './ExecutionOutboxEventPublisher';

/**
 * Phase 9g-4 — the durable counterpart to `OutboxRelayExecutionEventSink`
 * (Phase 9e). Where that sink calls `ExecutionOutboxEventPublisher.publish()`
 * directly (fire-and-forget — a failed publish loses the event), this sink
 * only appends to an `ExecutionEventOutboxStore` (`ExecutionEventOutbox.ts`).
 * The write is meant to happen in the SAME transaction as the Execution's own
 * state change (the `tx` param `ExecutionOrchestrator.transitionAndPersist()`
 * already threads through) — that's what makes the pattern atomic: either
 * both the state change and the outbox row commit, or neither does.
 *
 * Actual delivery (reading pending rows back out and publishing them, with
 * retry) is `ExecutionEventRelay`'s job, not this sink's — this class's only
 * responsibility is the durable write.
 */
export class TransactionalOutboxExecutionEventSink implements ExecutionEventSink {
  constructor(private readonly outbox: ExecutionEventOutboxStore) {}

  async publish(event: DomainEvent, _tx?: ITransactionContext): Promise<void> {
    const integrationEvent = toExecutionIntegrationEvent(event);
    await this.outbox.append(integrationEvent, {
      tenantId: event.tenantId,
      correlationId: event.correlationId,
    });
  }
}
