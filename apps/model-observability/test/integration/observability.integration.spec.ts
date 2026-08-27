import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertService } from '../../src/alert/alert.service';
import { DriftDetectionService } from '../../src/drift/drift.service';
import { TelemetryService } from '../../src/telemetry/telemetry.service';

describe('Model Observability Integration', () => {
  let alertService: AlertService;
  let driftService: DriftDetectionService;
  let telemetryService: TelemetryService;

  beforeEach(() => {
    alertService = new AlertService();
    driftService = new DriftDetectionService(alertService);
    telemetryService = new TelemetryService();
  });

  it('ingests telemetry and returns metrics for only the requested model', async () => {
    const timestamp = new Date().toISOString();
    await telemetryService.ingestTraces({
      spans: [
        { traceId: 'a-1', modelId: 'model-a', latencyMs: 100, timestamp },
        { traceId: 'a-2', modelId: 'model-a', latencyMs: 300, timestamp },
        { traceId: 'b-1', modelId: 'model-b', latencyMs: 900, timestamp }
      ]
    });

    await expect(telemetryService.getMetrics('model-a')).resolves.toMatchObject({
      latency_p50: 100,
      latency_p95: 100,
      latency_p99: 100,
      status: 'HEALTHY'
    });
  });

  it('emits an observability.drift.detected event when critical drift creates an alert', async () => {
    vi.spyOn(driftService, 'computePSI').mockReturnValue(0.3);
    const result = await driftService.detectDrift('model-a', [1], [2]);

    expect(result.classification).toBe('critical');
    expect(alertService.events).toHaveLength(1);
    expect(alertService.events[0]).toMatchObject({
      subject: 'observability.drift.detected',
      payload: alertService.alerts[0]
    });
  });
});
