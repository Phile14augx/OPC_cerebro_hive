import { describe, it, expect, beforeEach } from 'vitest';
import { TelemetryService } from '../../src/telemetry/telemetry.service';

describe('Telemetry Integration', () => {
  let service: TelemetryService;
  beforeEach(() => { service = new TelemetryService(); });

  it('should ingest telemetry data', async () => {
    await service.ingestTraces({ modelId: 'model-1', latencyMs: 120, timestamp: new Date().toISOString() });
    const metrics = await service.getMetrics('model-1');
    expect(metrics).toEqual({
      latency_p50: 120,
      latency_p95: 120,
      latency_p99: 120,
      status: 'HEALTHY'
    });
  });
});
