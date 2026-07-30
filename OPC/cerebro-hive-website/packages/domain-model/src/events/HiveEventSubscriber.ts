import type { HiveEventEnvelope } from './HiveEventEnvelope';

export type HiveEventHandler = (envelope: HiveEventEnvelope) => Promise<void>;

/**
 * Contract for subscribing to events by type. Interface only — no
 * in-memory or transport-backed implementation here (that's
 * infrastructure, per this slice's non-goals).
 */
export interface HiveEventSubscriber {
  subscribe(eventType: string, handler: HiveEventHandler): void;
  unsubscribe(eventType: string, handler: HiveEventHandler): void;
}
