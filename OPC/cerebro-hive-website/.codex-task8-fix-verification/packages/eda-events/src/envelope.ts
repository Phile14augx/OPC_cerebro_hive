/**
 * Event envelope — ADR 0001, Blueprint §9.1.
 *
 * CloudEvents 1.0 with three additions. Every event shares this shape; that
 * uniformity is what makes generic audit, replay and projection possible.
 */

export interface EventEnvelope<T = unknown> {
  readonly specversion: '1.0';
  /** ULID. Doubles as the idempotency key for at-least-once consumers. */
  readonly id: string;
  readonly source: string;
  /** `domain.entity.action.version`, e.g. `eda.job.completed.v1` */
  readonly type: string;
  readonly subject: string;
  readonly time: string;
  readonly datacontenttype: 'application/json';
  /** Enforced at the broker ACL layer, not in application code (ADR 0010). */
  readonly tenantid: string;
  readonly traceparent: string;
  /** Groups everything under one flow run. */
  readonly correlationid: string;
  /** The event that caused this one — reconstructs the causal chain, which is
   *  what you need when debugging why an agent proposed something. */
  readonly causationid?: string;
  readonly data: T;
}

/**
 * At-least-once delivery with idempotent consumers keyed on envelope id.
 * Exactly-once was rejected: the transactional overhead is real and every
 * consumer here is naturally idempotent (upserts into projections,
 * content-addressed artifact writes).
 */
export interface EventConsumer<T> {
  readonly consumerGroup: string;
  handle(event: EventEnvelope<T>): Promise<void>;
}

/** Transactional outbox — events are written in the same transaction as state. */
export interface Outbox {
  enqueue<T>(envelope: EventEnvelope<T>): Promise<void>;
}
