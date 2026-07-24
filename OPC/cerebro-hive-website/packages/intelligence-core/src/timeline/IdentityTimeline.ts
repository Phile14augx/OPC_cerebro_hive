import { TelemetryRecord } from '../store/TelemetryStore';

export class IdentityTimeline {
  constructor(public principalId: string, public events: TelemetryRecord[] = []) {}

  addEvent(event: TelemetryRecord) {
    this.events.push(event);
    this.events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  getEventsSince(date: Date): TelemetryRecord[] {
    return this.events.filter(e => e.timestamp >= date);
  }

  getEventsByType(type: string): TelemetryRecord[] {
    return this.events.filter(e => e.eventType === type);
  }

  /**
   * Generates a forensic summary of the identity's activity.
   */
  summarize(): string {
    if (this.events.length === 0) return `No activity for ${this.principalId}`;
    
    const start = this.events[0].timestamp.toISOString();
    const end = this.events[this.events.length - 1].timestamp.toISOString();
    const denies = this.getEventsByType('PolicyDeny').length;

    return `Timeline for ${this.principalId} (${start} to ${end}) | Total Events: ${this.events.length} | Denies: ${denies}`;
  }
}
