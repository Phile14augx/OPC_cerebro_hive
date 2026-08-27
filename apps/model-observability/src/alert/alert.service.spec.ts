import { beforeEach, describe, expect, it } from 'vitest';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    service = new AlertService();
  });

  it('should create a drift alert and store it', async () => {
    const alert = await service.createDriftAlert('m1', 0.5, 0.2, 'featureA');
    expect(alert.modelId).toBe('m1');
    expect(alert.value).toBe(0.5);
    expect(alert.threshold).toBe(0.2);
    expect(alert.featureName).toBe('featureA');
    expect(service.alerts.length).toBe(1);
  });
});
