import type { HiveEventEnvelope } from './HiveEventEnvelope';

/**
 * Contract for (de)serializing an envelope to/from a wire format. Interface
 * only — no JSON/Avro/Protobuf implementation here; a real implementation
 * is an infrastructure concern (and would need to decide how HiveDomainEvent
 * vs. HiveIntegrationEvent schema-versioning interacts with the wire
 * format, which this contract deliberately leaves open).
 */
export interface HiveEventSerializer {
  serialize(envelope: HiveEventEnvelope): string;
  deserialize(payload: string): HiveEventEnvelope;
}
