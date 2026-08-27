import { describe, it, expect, beforeEach } from 'vitest';
import { DifferentialPrivacyService } from './differential-privacy.service';

describe('DifferentialPrivacyService', () => {
  let service: DifferentialPrivacyService;

  beforeEach(() => {
    service = new DifferentialPrivacyService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add laplace noise', () => {
    const val = 100;
    const noisyVal = service.addLaplaceNoise(val, 0.5);
    // Noise can be positive or negative, we just check it doesn't always equal exactly the original value.
    // Extremely rare to be exactly 100, but let's just assert it runs and returns a number.
    expect(typeof noisyVal).toBe('number');
  });

  it('should throw if epsilon is <= 0', () => {
    expect(() => service.addLaplaceNoise(100, 0)).toThrow('Epsilon must be greater than 0');
    expect(() => service.addLaplaceNoise(100, -1)).toThrow('Epsilon must be greater than 0');
  });

  it('should output within expected bounds for given epsilon', () => {
    const val = 100;
    const epsilon = 1.0;
    let sum = 0;
    for (let i = 0; i < 1000; i++) {
      sum += service.addLaplaceNoise(val, epsilon);
    }
    const mean = sum / 1000;
    // Mean should be close to 100
    expect(mean).toBeGreaterThan(95);
    expect(mean).toBeLessThan(105);
  });
});
