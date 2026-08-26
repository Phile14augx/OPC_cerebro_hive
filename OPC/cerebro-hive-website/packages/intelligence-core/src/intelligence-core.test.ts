import { describe, expect, it } from 'vitest';
import {
  EventAggregator,
  InMemoryTelemetryStore,
  type TelemetryRecord,
} from './index';

function record(
  id: string,
  principalId: string,
  eventType: string,
  timestamp: string,
): TelemetryRecord {
  return {
    id,
    principalId,
    eventType,
    timestamp: new Date(timestamp),
    severity: 'Info',
    metadata: {},
  };
}

describe('intelligence timeline aggregation', () => {
  it('isolates a principal and orders its timeline chronologically', async () => {
    const store = new InMemoryTelemetryStore();
    const aggregator = new EventAggregator(store);
    await aggregator.consumeEvent(record('late', 'principal-1', 'CapabilityAccessed', '2026-01-01T11:00:00.000Z'));
    await aggregator.consumeEvent(record('other', 'principal-2', 'PolicyDeny', '2026-01-01T09:00:00.000Z'));
    await aggregator.consumeEvent(record('early', 'principal-1', 'PolicyDeny', '2026-01-01T10:00:00.000Z'));

    const timeline = await aggregator.buildTimeline('principal-1');

    expect(timeline.events.map(event => event.id)).toEqual(['early', 'late']);
    expect(timeline.summarize()).toBe(
      'Timeline for principal-1 (2026-01-01T10:00:00.000Z to 2026-01-01T11:00:00.000Z) | Total Events: 2 | Denies: 1',
    );
  });

  it('applies an inclusive since boundary when building a timeline', async () => {
    const store = new InMemoryTelemetryStore();
    const aggregator = new EventAggregator(store);
    await aggregator.consumeEvent(record('before', 'principal-1', 'Login', '2026-01-01T09:59:59.000Z'));
    await aggregator.consumeEvent(record('boundary', 'principal-1', 'Login', '2026-01-01T10:00:00.000Z'));

    const timeline = await aggregator.buildTimeline('principal-1', new Date('2026-01-01T10:00:00.000Z'));

    expect(timeline.events.map(event => event.id)).toEqual(['boundary']);
  });
});
