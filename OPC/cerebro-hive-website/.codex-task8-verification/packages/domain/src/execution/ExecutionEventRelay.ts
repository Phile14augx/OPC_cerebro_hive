import { ExecutionEventOutboxStore } from './ExecutionEventOutbox';
import { ExecutionOutboxEventPublisher } from './ExecutionOutboxEventPublisher';
import { ExecutionTelemetry, NoOpExecutionTelemetry } from './ExecutionTelemetry';

/**
 * Phase 9g-4 — the "read it back and actually deliver it" half of the
 * transactional-outbox pattern, mirroring `packages/events`'
 * `PollingRelayStrategy`/`OutboxRelayWorker` (adopted conceptually per
 * `ADR-043`) without importing them — same bounded-context-separation
 * reasoning as everywhere else in Phase 9 (this package does not depend on
 * `@cerebro/db` or `@cerebro/events`).
 *
 * `relayOnce()` processes one batch of pending entries and returns; it does
 * not itself loop, sleep, or schedule repeated calls — that's a live-wiring
 * concern (a real process calling `relayOnce()` on an interval, or via
 * `ExecutionScheduler`/`TimerSource`) deliberately left out of this
 * standalone phase, same as `ExecutionScheduler.tick()`'s own scope boundary.
 */
export interface ExecutionEventRelayOptions {
  /** Max entries processed per `relayOnce()` call. Defaults to 50. */
  readonly batchSize?: number;
  /** An entry is marked permanently failed (moved to `'failed'`, no further
   * retries) once its `attempts` count (after this failure) reaches this
   * value. Defaults to 5. */
  readonly maxAttempts?: number;
}

export interface ExecutionEventRelayResult {
  readonly processed: number;
  readonly published: number;
  readonly failed: number;
  readonly permanentlyFailed: number;
}

export class ExecutionEventRelay {
  private readonly batchSize: number;
  private readonly maxAttempts: number;
  private readonly telemetry: ExecutionTelemetry;

  constructor(
    private readonly outbox: ExecutionEventOutboxStore,
    private readonly publisher: ExecutionOutboxEventPublisher,
    options: ExecutionEventRelayOptions & { telemetry?: ExecutionTelemetry } = {}
  ) {
    this.batchSize = options.batchSize ?? 50;
    this.maxAttempts = options.maxAttempts ?? 5;
    this.telemetry = options.telemetry ?? new NoOpExecutionTelemetry();
  }

  async relayOnce(): Promise<ExecutionEventRelayResult> {
    const pending = await this.outbox.loadPending(this.batchSize);

    let published = 0;
    let failed = 0;
    let permanentlyFailed = 0;

    for (const entry of pending) {
      try {
        await this.publisher.publish(entry.event, entry.context);
        await this.outbox.markPublished(entry.id);
        published += 1;
      } catch (error) {
        const attemptsAfterThisFailure = entry.attempts + 1;
        const permanent = attemptsAfterThisFailure >= this.maxAttempts;
        const message = error instanceof Error ? error.message : String(error);
        await this.outbox.markFailed(entry.id, message, { permanent });
        failed += 1;
        if (permanent) {
          permanentlyFailed += 1;
        }
      }
    }

    this.telemetry.recordRelayBatch(pending.length, published, failed, permanentlyFailed);

    return {
      processed: pending.length,
      published,
      failed,
      permanentlyFailed,
    };
  }
}
