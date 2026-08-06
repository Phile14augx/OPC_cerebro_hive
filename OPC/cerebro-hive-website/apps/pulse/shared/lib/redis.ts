/**
 * HivePulse — Redis client singleton (ioredis)
 * Used for caching computed health scores and briefings to avoid
 * re-querying Postgres and re-calling Claude on every page load.
 */
import Redis from 'ioredis';

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error('[HivePulse] REDIS_URL is not set. Add it to .env');
  }
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });
  client.on('error', (err) => {
    console.error('[HivePulse/Redis]', err.message);
  });
  return client;
}

export const redis: Redis =
  process.env.NODE_ENV === 'production'
    ? createClient()
    : (global.__redis ?? (global.__redis = createClient()));

/* ── Typed cache helpers ─────────────────────────────────────────────────── */
const TTL = {
  HEALTH_SCORE:  30,   // seconds — live-ish
  ALERTS:        60,
  BRIEFING_LIST: 120,
  BRIEFING_BODY: 3600, // briefings are generated once and cached
  SCENARIO:      300,
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function cacheSet<T>(key: string, value: T, ttl = TTL.HEALTH_SCORE): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

export { TTL };
