// =============================================================================
// CerebroHive AI Gateway — In-memory token-bucket rate limiter
// For production, back with Redis (sliding window) via ioredis.
// =============================================================================

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  /** organizationId:provider → bucket */
  private buckets = new Map<string, Bucket>();

  constructor(
    /** Max requests per minute */
    private readonly rpmLimit: number,
    /** Max tokens per minute (0 = unlimited) */
    private readonly tpmLimit = 0
  ) {}

  /**
   * Attempt to consume a request slot for org+provider.
   * Returns true if allowed, false if rate limited.
   */
  consume(key: string, tokens = 0): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.rpmLimit, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill pro-rated for time elapsed (up to the limit)
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const refill = elapsed * (this.rpmLimit / 60);
    bucket.tokens = Math.min(this.rpmLimit, bucket.tokens + refill);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      return false; // rate limited
    }

    bucket.tokens -= 1;
    return true;
  }

  /** Returns seconds until the next available slot */
  retryAfterSeconds(key: string): number {
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.tokens >= 1) return 0;
    const deficit = 1 - bucket.tokens;
    return deficit / (this.rpmLimit / 60);
  }

  /** Cleanup stale buckets (call periodically) */
  cleanup(maxAgeMs = 5 * 60 * 1000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastRefill < cutoff) this.buckets.delete(key);
    }
  }
}
