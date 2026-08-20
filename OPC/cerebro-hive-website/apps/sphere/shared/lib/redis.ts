import Redis from 'ioredis';

declare global { var __sphereRedis: Redis | undefined; }

function createClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('[CerebroSphere] REDIS_URL is not set.');
  const client = new Redis(url, { maxRetriesPerRequest: 3, enableReadyCheck: true });
  client.on('error', (err) => console.error('[Sphere/Redis]', err.message));
  return client;
}

function getRedis(): Redis {
  return global.__sphereRedis ?? (global.__sphereRedis = createClient());
}

export const TTL = {
  DASHBOARD:   20,   // seconds — live data
  NARRATIVE:   300,  // role narrative valid for 5 min
  PRODUCT_GRID: 60,
  AGENTS:      15,
  FINOPS:      120,
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  await getRedis().set(key, JSON.stringify(value), 'EX', ttl);
}
