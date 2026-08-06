/**
 * HivePulse — Platform-API HTTP client
 * Wraps the Fastify backend at NEXT_PUBLIC_PLATFORM_API_URL (default: http://localhost:8090)
 */

const BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PLATFORM_API_URL) ||
  'http://localhost:8090';

export interface TelemetryOverview {
  rpm: number;
  avgLatencyMs: number;
  errorRate: number;
  totalCostUsd: number;
  agentSuccessRate: number;
  activeAgents: number;
  recordedAt: string;
}

export interface ServiceHealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'critical' | 'unknown';
  latencyMs: number;
  lastCheckedAt: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    // Server components: don't cache telemetry longer than 30s
    next: { revalidate: 30 },
  } as RequestInit & { next?: { revalidate?: number } });

  if (!res.ok) {
    throw new Error(`Platform-API ${path} → ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Live system telemetry: RPM, latency, error rate, cost */
export async function getTelemetryOverview(): Promise<TelemetryOverview> {
  return apiFetch<TelemetryOverview>('/telemetry/overview');
}

/** Health status per micro-service */
export async function getServiceHealth(): Promise<ServiceHealthStatus[]> {
  return apiFetch<ServiceHealthStatus[]>('/health/services');
}
