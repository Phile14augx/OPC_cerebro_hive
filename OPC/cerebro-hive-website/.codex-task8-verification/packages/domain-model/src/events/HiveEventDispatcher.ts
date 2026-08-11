import type { HiveEventEnvelope } from './HiveEventEnvelope';

/**
 * Contract for in-process routing of an envelope to whichever local
 * handlers care about it — distinct from HiveEventPublisher (which sends
 * an envelope *out* of the process to a transport) and HiveEventBus (which
 * composes publish+subscribe for external distribution). A dispatcher is
 * the purely local "who in this process should react to this" concern —
 * e.g. an AggregateRoot's buffered events (Slice 1) being handed off to
 * in-process projections/handlers before anything is published externally.
 * Interface only, no concrete routing implementation.
 */
export interface HiveEventDispatcher {
  dispatch(envelope: HiveEventEnvelope): Promise<void>;
}
