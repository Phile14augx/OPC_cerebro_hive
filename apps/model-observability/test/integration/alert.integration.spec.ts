import { describe, it, expect, beforeEach } from 'vitest';
import { AlertService } from '../../src/alert/alert.service';

describe('Alert Integration', () => {
  let service: AlertService;
  beforeEach(() => { service = new AlertService(); });

  it('should emit alert', async () => {
    const alert = await service.createDriftAlert('model-1', 0.4, 0.25, 'input_feature');
    expect(alert).toBeDefined();
    expect(alert.modelId).toBe('model-1');
    expect(alert.value).toBe(0.4);
    expect(service.alerts).toContain(alert);
  });
});
