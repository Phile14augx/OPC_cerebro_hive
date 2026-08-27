import { Injectable } from '@nestjs/common';

@Injectable()
export class DifferentialPrivacyService {
  /**
   * Adds Laplace noise to a numeric value for differential privacy.
   * @param value The original numeric value
   * @param epsilon The privacy budget parameter
   * @param sensitivity The sensitivity of the query
   * @returns The privatised value with added Laplace noise
   */
  addLaplaceNoise(value: number, epsilon: number, sensitivity: number = 1.0): number {
    if (epsilon <= 0) {
      throw new Error('Epsilon must be greater than 0');
    }
    const scale = sensitivity / epsilon;
    const noise = this.generateLaplaceNoise(scale);
    return value + noise;
  }

  private generateLaplaceNoise(scale: number): number {
    // Inverse transform sampling for Laplace distribution
    const u = Math.random() - 0.5; // Uniform between -0.5 and 0.5
    const sign = u < 0 ? -1 : 1;
    return -scale * sign * Math.log(1 - 2 * Math.abs(u));
  }
}
