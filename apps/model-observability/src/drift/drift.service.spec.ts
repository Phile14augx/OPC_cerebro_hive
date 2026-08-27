import { DriftDetectionService } from './drift.service';
import { AlertService } from '../alert/alert.service';

describe('DriftDetectionService', () => {
  let service: DriftDetectionService;
  let alertService: AlertService;

  beforeEach(() => {
    alertService = new AlertService();
    service = new DriftDetectionService(alertService);
  });

  it('should compute PSI correctly for identical distributions', () => {
    const ref = [1, 2, 3, 4, 5];
    const curr = [1, 2, 3, 4, 5];
    const psi = service.computePSI(ref, curr, 5);
    expect(psi).toBeCloseTo(0, 3);
  });

  it('should compute PSI > 0 for different distributions', () => {
    const ref = [1, 1, 1, 2, 2];
    const curr = [5, 5, 5, 4, 4];
    const psi = service.computePSI(ref, curr, 5);
    expect(psi).toBeGreaterThan(0);
  });

  it('should classify as stable when PSI < 0.1', async () => {
    const ref = [1, 2, 3];
    const curr = [1, 2, 3];
    const result = await service.detectDrift('m1', ref, curr);
    expect(result.classification).toBe('stable');
    expect(alertService.alerts.length).toBe(0);
  });

  it('should classify as warning when 0.1 <= PSI <= 0.25', async () => {
    vi.spyOn(service, 'computePSI').mockReturnValue(0.15);
    const result = await service.detectDrift('m1', [1], [2]);
    expect(result.classification).toBe('warning');
    expect(alertService.alerts.length).toBe(0);
  });

  it('should classify as critical when PSI > 0.25 and alert', async () => {
    vi.spyOn(service, 'computePSI').mockReturnValue(0.3);
    const result = await service.detectDrift('m1', [1], [2]);
    expect(result.classification).toBe('critical');
    expect(alertService.alerts.length).toBe(1);
    expect(alertService.alerts[0].modelId).toBe('m1');
    expect(alertService.alerts[0].value).toBe(0.3);
  });

  it('should have createBaseline method', async () => {
    await expect(service.createBaseline('m1', {})).resolves.toBeUndefined();
  });
});
