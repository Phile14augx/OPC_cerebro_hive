import { afterEach, describe, expect, it, vi } from 'vitest';
import { DifferentialPrivacyService } from '../../src/services/differential-privacy.service';

describe('Differential Privacy Integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scales deterministic Laplace noise by sensitivity divided by epsilon', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75);
    const service = new DifferentialPrivacyService();

    const privatisedValue = service.addLaplaceNoise(10, 2, 4);

    expect(privatisedValue).toBeCloseTo(11.3862943611, 10);
  });

  it('applies the corresponding negative noise below the midpoint', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.25);
    const service = new DifferentialPrivacyService();

    const privatisedValue = service.addLaplaceNoise(10, 2, 4);

    expect(privatisedValue).toBeCloseTo(8.6137056389, 10);
  });

  it.each([0, -0.5])('rejects non-positive epsilon %s', epsilon => {
    const service = new DifferentialPrivacyService();

    expect(() => service.addLaplaceNoise(10, epsilon)).toThrow(
      'Epsilon must be greater than 0',
    );
  });
});
