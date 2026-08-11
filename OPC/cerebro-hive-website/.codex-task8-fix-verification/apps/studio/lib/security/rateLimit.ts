/**
 * In-memory sliding-window rate limiter for Route Handlers and Server Actions.
 *
 * This is intentionally simple: a single Node process holding counters in a Map.
 * It's correct and effective for a single-instance deployment (one Railway/Render
 * service, one Vercel serverless region under light concurrency) but does NOT
 * coordinate across multiple instances/regions — if this app is horizontally
 * scaled, replace this with a shared store (Upstash Redis + @upstash/ratelimit is
 * the standard choice on Vercel/edge). That upgrade is called out explicitly in
 * the security roadmap doc; this module exists so every mutating endpoint has
 * *some* real limit today instead of none.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop stale buckets so this doesn't grow unbounded over a long
// process lifetime.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > SWEEP_INTERVAL_MS) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * @param key    Unique bucket key — should combine the route name and caller
 *               identity (IP, session id, API key, etc).
 * @param limit  Max requests allowed per window.
 * @param windowMs Window size in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { ok: true, limit, remaining: limit - 1, resetMs: windowMs };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return {
    ok,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetMs: Math.max(0, windowMs - (now - existing.windowStart)),
  };
}

/**
 * Best-effort caller IP extraction behind a reverse proxy / CDN. Next.js Route
 * Handlers don't expose a trustworthy `request.ip` on all runtimes, so this reads
 * the standard forwarding headers a proxy (Cloudflare, Railway, Vercel) sets, and
 * falls back to a constant so unrelated callers aren't accidentally lumped into
 * one bucket in local dev.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;
  return "unknown";
}

export function rateLimitResponseHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetMs / 1000)),
  };
}
