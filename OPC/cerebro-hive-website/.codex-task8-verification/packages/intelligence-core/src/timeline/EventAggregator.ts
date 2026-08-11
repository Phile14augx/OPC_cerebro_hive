import { TelemetryStore, TelemetryRecord } from '../store/TelemetryStore';
import { IdentityTimeline } from './IdentityTimeline';

export class EventAggregator {
  constructor(private store: TelemetryStore) {}

  /**
   * Consumes an event from the platform's EventBus and stores it.
   */
  async consumeEvent(event: TelemetryRecord): Promise<void> {
    await this.store.saveRecord(event);
  }

  /**
   * Constructs a full IdentityTimeline by retrieving all events for a given principal.
   */
  async buildTimeline(principalId: string, since?: Date): Promise<IdentityTimeline> {
    const events = await this.store.getRecordsForPrincipal(principalId, since);
    return new IdentityTimeline(principalId, events);
  }
}
