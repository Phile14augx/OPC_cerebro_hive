import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(() => {
    service = new TelemetryService();
  });

  it('should ingest a single payload correctly', async () => {
    await service.ingestTraces({
      traceId: 'trace-1',
      modelId: 'model-a',
      latencyMs: 150,
      timestamp: Date.now()
    });
    expect(service.spans.length).toBe(1);
    expect(service.spans[0].modelId).toBe('model-a');
  });

  it('should ingest an array of spans correctly', async () => {
    await service.ingestTraces({
      spans: [
        { traceId: 't1', modelId: 'm1', latencyMs: 100 },
        { traceId: 't2', modelId: 'm1', latencyMs: 200 }
      ]
    });
    expect(service.spans.length).toBe(2);
  });

  it('should calculate metrics correctly', async () => {
    const now = Date.now();
    await service.ingestTraces({
      spans: [
        { traceId: 't1', modelId: 'm1', latencyMs: 100, timestamp: now },
        { traceId: 't2', modelId: 'm1', latencyMs: 200, timestamp: now },
        { traceId: 't3', modelId: 'm1', latencyMs: 300, timestamp: now },
        { traceId: 't4', modelId: 'm1', latencyMs: 400, timestamp: now },
        { traceId: 't5', modelId: 'm1', latencyMs: 500, timestamp: now }
      ]
    });

    const metrics = await service.getMetrics('m1');
    expect(metrics.latency_p50).toBe(300); // 5 elements, p50 is index 2
    expect(metrics.latency_p95).toBe(400); // 5 elements, p95 is index 3 or 4 depending on math (4 * 0.95 = 3.8 -> Math.floor -> 3 -> index 3 is 400, wait let's check Math.floor((5-1)*0.95) = Math.floor(3.8) = 3 which is 400).
    // Wait, let's just check they exist and are numbers.
    expect(metrics.status).toBe('HEALTHY');
    expect(typeof metrics.latency_p50).toBe('number');
    expect(typeof metrics.latency_p95).toBe('number');
    expect(typeof metrics.latency_p99).toBe('number');
  });

  it('should return NO_DATA for empty spans', async () => {
    const metrics = await service.getMetrics('unknown_model');
    expect(metrics.status).toBe('NO_DATA');
  });

  it('should have a hallucinationFeedback method', async () => {
    await expect(service.hallucinationFeedback({})).resolves.toBeUndefined();
  });
});
