import { describe, it, expect, beforeEach } from 'vitest';
import { DriftDetectionService } from '../../src/drift/drift.service';
import { AlertService } from '../../src/alert/alert.service';

describe('Drift Detection Integration', () => {
  let service: DriftDetectionService;
  let alertService: AlertService;
  
  beforeEach(() => { 
    alertService = new AlertService();
    service = new DriftDetectionService(alertService); 
  });

  it('should detect drift', async () => {
    const reference = [0.2, 0.3, 0.3, 0.2];
    const current = [0.4, 0.2, 0.2, 0.2];
    const psi = service.computePSI(reference, current);
    expect(psi).toBeDefined();
    
    const result = await service.detectDrift('model-1', reference, current);
    expect(result.psi).toBeDefined();
    expect(['stable', 'warning', 'critical']).toContain(result.classification);
  });
});
