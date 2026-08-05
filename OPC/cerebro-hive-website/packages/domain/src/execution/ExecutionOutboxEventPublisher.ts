/**
 * Phase 9e — the seam through which `Execution`'s canonical events
 * (`ExecutionEvents.ts`) reach `packages/events`' outbox-relay-to-NATS
 * pipeline, adopted per `ADR-043` as the platform's real event-transport
 * foundation (over `packages/core-bus`'s orphaned `DomainEventBus` and
 * `packages/domain-model`'s unimplemented `HiveEventBus`).
 *
 * This interface is deliberately shaped to be STRUCTURALLY IDENTICAL to
 * `packages/core-bus`'s real `IIntegrationEventPublisher`
 * (`publish(event: IntegrationEvent, context: RequestContext): Promise<void>`,
 * where `IntegrationEvent` has a `type: string` field and `RequestContext`
 * has a required `tenantId: string`) — confirmed by direct reading of
 * `packages/core-bus/src/EventBus.ts` and `packages/core-bus/src/Event.ts`.
 * A real `NatsIntegrationEventPublisher` instance
 * (`packages/events/src/NatsPublisher.ts`) already satisfies this interface
 * by TypeScript's structural typing — no adapter class or cast is needed to
 * pass one in.
 *
 * `packages/domain` does NOT import `@cerebro/core-bus` or
 * `@cerebro/events` to declare this — same bounded-context-separation
 * reasoning as `ExecutionProviderPort` (Phase 9c) staying off
 * `HiveProviderExecutor`. It is also, honestly, a real environment
 * constraint: `@cerebro/db` (a transitive dependency of both
 * `@cerebro/core-bus` and `packages/events`) depends on a generated
 * `@prisma/client` that does not exist in this sandbox, so a real
 * cross-package build was not possible to run here — the structural-
 * compatibility claim above is verified by direct comparison of the real
 * source files (cited), not by a live `tsc` build spanning both packages.
 */
import { DomainEvent } from '../events/DomainEvent';

export interface ExecutionIntegrationEventLike {
  readonly type: string;
  readonly aggregateId: string;
  readonly [key: string]: unknown;
}

export interface ExecutionEventContext {
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly traceId?: string;
}

export interface ExecutionOutboxEventPublisher {
  publish(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<void>;
}

/**
 * Phase 9g-4 — the canonical `DomainEvent` → `ExecutionIntegrationEventLike`
 * conversion, factored out here so `OutboxRelayExecutionEventSink.ts` (Phase
 * 9e) and `TransactionalOutboxExecutionEventSink.ts` (Phase 9g-4) share one
 * implementation instead of two copies drifting apart. Both sinks convert
 * the same way; they differ only in what happens to the result (publish
 * immediately vs. append to a durable outbox).
 */
export function toExecutionIntegrationEvent(event: DomainEvent): ExecutionIntegrationEventLike {
  return {
    type: event.constructor.name,
    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    eventId: event.eventId,
    occurredAt: event.timestamp.toISOString(),
    payload: event.payload,
  };
}
