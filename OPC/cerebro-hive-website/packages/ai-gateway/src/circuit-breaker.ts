// =============================================================================
// CerebroHive AI Gateway — Circuit Breaker per provider
// Three-state: CLOSED → OPEN → HALF_OPEN → CLOSED
// =============================================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Error rate (0–1) to trip the circuit. Default: 0.5 */
  errorThreshold: number;
  /** Minimum requests before tripping. Default: 10 */
  minRequests: number;
  /** Time in ms before trying again (HALF_OPEN). Default: 30_000 */
  resetTimeoutMs: number;
  /** Sliding window size. Default: 60 */
  windowSize: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private successes = 0;
  private failures = 0;
  private lastFailureTime = 0;
  private readonly cfg: Required<CircuitBreakerConfig>;

  constructor(
    public readonly name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.cfg = {
      errorThreshold: config.errorThreshold ?? 0.5,
      minRequests: config.minRequests ?? 10,
      resetTimeoutMs: config.resetTimeoutMs ?? 30_000,
      windowSize: config.windowSize ?? 60,
    };
  }

  get currentState(): CircuitState { return this.state; }

  isAvailable(): boolean {
    if (this.state === 'CLOSED') return true;

    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.cfg.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    // HALF_OPEN — allow one probe through
    return true;
  }

  recordSuccess(): void {
    this.successes++;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.reset();
    }
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      return;
    }

    const total = this.successes + this.failures;
    if (total >= this.cfg.minRequests) {
      const errorRate = this.failures / total;
      if (errorRate >= this.cfg.errorThreshold) {
        this.state = 'OPEN';
      }
    }
  }

  private reset(): void {
    this.successes = 0;
    this.failures = 0;
  }

  toJSON() {
    return {
      name: this.name,
      state: this.state,
      successes: this.successes,
      failures: this.failures,
      errorRate: this.successes + this.failures > 0
        ? this.failures / (this.successes + this.failures)
        : 0,
    };
  }
}
