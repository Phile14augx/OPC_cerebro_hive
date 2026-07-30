import type { HiveEventEnvelope } from './HiveEventEnvelope';

/**
 * Contract for publishing an envelope out of the current process — to a
 * transport (SNS, an outbox table, whatever a future infrastructure slice
 * chooses). **Interface only**: no Kafka/NATS/SNS/SQS/EventStoreDB/outbox
 * implementation lives in this package, per Slice 3's explicit non-goals —
 * those are infrastructure packages built against this contract later.
 */
export interface HiveEventPublisher {
  publish(envelope: HiveEventEnvelope): Promise<void>;
}
