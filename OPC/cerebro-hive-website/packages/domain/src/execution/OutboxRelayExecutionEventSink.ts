import { DomainEvent } from '../events/DomainEvent';
import { ITransactionContext } from '../transactions/UnitOfWork';
import { ExecutionEventSink } from './ExecutionOrchestrator';
import { ExecutionOutboxEventPublisher, toExecutionIntegrationEvent } from './ExecutionOutboxEventPublisher';

/**
 * Phase 9e's real `ExecutionEventSink` implementation (the seam
 * `ExecutionOrchestrator`, Phase 9c, was already built to accept —
 * `transitionAndPersist()` calls `this.events?.publish(event, tx)` with no
 * changes needed here). Converts an `Execution` canonical `DomainEvent` into
 * the `{ type, aggregateId, ... }` shape `ExecutionOutboxEventPublisher`
 * (and, transitively, a real `NatsIntegrationEventPublisher`) expects.
 *
 * Does not itself publish to NATS, write to any outbox table, or start any
 * relay — it only shapes the conversion and delegates to whatever
 * `ExecutionOutboxEventPublisher` it is constructed with. Wiring a real
 * `NatsIntegrationEventPublisher` (or the outbox-writing front half,
 * `PollingRelayStrategy` + `OutboxRelayWorker`) into a live process remains
 * unstarted — no live NATS broker exists in this environment to verify
 * against, and starting one would be live wiring, out of this phase's scope
 * per the same standalone discipline as 9a–9d.
 */
export class OutboxRelayExecutionEventSink implements ExecutionEventSink {
  constructor(private readonly publisher: ExecutionOutboxEventPublisher) {}

  async publish(event: DomainEvent, _tx?: ITransactionContext): Promise<void> {
    const integrationEvent = toExecutionIntegrationEvent(event);

    await this.publisher.publish(integrationEvent, {
      tenantId: event.tenantId,
      correlationId: event.correlationId,
    });
  }
}
