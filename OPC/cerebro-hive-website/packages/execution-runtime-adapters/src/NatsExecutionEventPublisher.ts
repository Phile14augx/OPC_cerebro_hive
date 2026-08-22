import {
  ExecutionEventContext,
  ExecutionIntegrationEventLike,
  ExecutionOutboxEventPublisher,
} from '@cerebro/domain/src/execution/ExecutionOutboxEventPublisher';
import { NatsIntegrationEventPublisher } from '@cerebro/events';

/**
 * Phase 9g-1 — the concrete, named production adapter connecting
 * `packages/domain`'s `ExecutionOutboxEventPublisher` contract (Phase
 * 9e/`ADR-043`) to `packages/events`' real `NatsIntegrationEventPublisher`.
 * `ADR-043` already established these two interfaces are structurally
 * compatible by design (same `publish(event, context)` shape); this class
 * exists for explicitness and lifecycle management at the wiring layer
 * (`connect()`/`close()`), not because structural typing alone was
 * insufficient.
 *
 * Bounded-context note: unlike `packages/domain` itself (which deliberately
 * does not import `@cerebro/events`/`@cerebro/core-bus`, per `ADR-043`),
 * THIS package exists specifically to bridge that boundary for real
 * production wiring — importing both `@cerebro/domain` (for the contract)
 * and `@cerebro/events` (for the real implementation) is exactly this
 * package's job, not a violation of the separation `ADR-043` drew.
 *
 * VERIFICATION BOUNDARY (see `ADR-046`, honestly disclosed, not glossed
 * over): `@cerebro/events` transitively depends on `@cerebro/core-bus` and
 * `@cerebro/db`, and `@cerebro/db` depends on a `@prisma/client`
 * that has no generated client in this sandbox — the same constraint that
 * blocked a real cross-package `tsc` build throughout Phase 9e. This file
 * could NOT be typechecked via this repository's scratch-toolchain
 * verification pattern for that reason; it is written to the real,
 * documented shape of both interfaces, but is unverified by compilation
 * here, not merely unverified by a live NATS connection. The explicit `as`
 * casts below exist because true structural compatibility could not be
 * confirmed by the compiler in this environment — they are a disclosed risk
 * point, not a shortcut taken silently.
 */
export class NatsExecutionEventPublisher implements ExecutionOutboxEventPublisher {
  private readonly delegate: NatsIntegrationEventPublisher;

  constructor(natsUrl: string) {
    this.delegate = new NatsIntegrationEventPublisher(natsUrl);
  }

  async connect(): Promise<void> {
    await this.delegate.connect();
  }

  async close(): Promise<void> {
    await this.delegate.close();
  }

  async publish(event: ExecutionIntegrationEventLike, context: ExecutionEventContext): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.delegate.publish(event as any, context as any);
  }
}
