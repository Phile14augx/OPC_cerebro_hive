import {
  ExecutionOrchestrator,
  ExecutionProviderPort,
} from '@cerebro/domain/src/execution/ExecutionOrchestrator';
import { ExecutionRepository } from '@cerebro/domain/src/execution/ExecutionRepository';
import { InMemoryExecutionRepository } from '@cerebro/domain/src/execution/InMemoryExecutionRepository';
import { OutboxRelayExecutionEventSink } from '@cerebro/domain/src/execution/OutboxRelayExecutionEventSink';
import { ExecutionRuntimeConfig } from './config';
import { PostgresExecutionLeaseStore } from './PostgresExecutionLeaseStore';
import { PostgresExecutionIdempotencyStore } from './PostgresExecutionIdempotencyStore';
import { NatsExecutionEventPublisher } from './NatsExecutionEventPublisher';
import { PgQueryable } from './PgQueryable';

/**
 * Phase 9g-1 — composition root demonstrating how the production adapters
 * in this package actually wire into a real `ExecutionOrchestrator`. This is
 * real, usable wiring code, not a sketch — but calling `connect()` requires
 * an actually-reachable NATS server, which does not exist in this sandbox
 * (see `ADR-046`). `repository` still defaults to the standalone
 * `InMemoryExecutionRepository` (Phase 9d) — 9g-1's own scope was narrowed
 * to leases, idempotency, and event delivery only; a Postgres-backed
 * `ExecutionRepository` was NOT part of this pass and is not invented here
 * to fill the gap.
 */
export interface ProductionExecutionRuntime {
  readonly orchestrator: ExecutionOrchestrator;
  readonly natsPublisher: NatsExecutionEventPublisher;
  connect(): Promise<void>;
  close(): Promise<void>;
}

export function buildProductionExecutionOrchestrator(
  config: ExecutionRuntimeConfig,
  pool: PgQueryable,
  provider: ExecutionProviderPort,
  repository: ExecutionRepository = new InMemoryExecutionRepository()
): ProductionExecutionRuntime {
  const leaseStore = new PostgresExecutionLeaseStore(pool);
  const idempotencyStore = new PostgresExecutionIdempotencyStore(pool);
  const natsPublisher = new NatsExecutionEventPublisher(config.natsUrl);
  const eventSink = new OutboxRelayExecutionEventSink(natsPublisher);

  const orchestrator = new ExecutionOrchestrator(repository, provider, eventSink, {
    leaseStore,
    idempotencyStore,
  });

  return {
    orchestrator,
    natsPublisher,
    async connect(): Promise<void> {
      await natsPublisher.connect();
    },
    async close(): Promise<void> {
      await natsPublisher.close();
    },
  };
}
