export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

export type CloudProvider = "aws" | "azure" | "gcp" | "on-prem";
export type CloudEnvironment = "production" | "staging" | "development";
export interface CloudAccount {
  id: string; organizationId: string; accountName: string; provider: CloudProvider; region: string;
  environment: CloudEnvironment; status: "active" | "provisioning"; monthlyCostUsd: number;
  complianceScore: number; landingZoneComponents: string[]; createdAt: string;
}

export type StorageTier = "hot" | "warm" | "cold" | "archive";
export interface StorageBucket {
  id: string; organizationId: string; name: string; provider: CloudProvider; tier: StorageTier;
  sizeGb: number; encrypted: boolean; replicationFactor: number; monthlyCostUsd: number;
  lifecyclePolicy: string; createdAt: string;
}

export type ComputeKind = "vm" | "container" | "serverless";
export type ComputeSizeTier = "small" | "medium" | "large" | "xlarge";
export interface ComputeInstance {
  id: string; organizationId: string; name: string; kind: ComputeKind; sizeTier: ComputeSizeTier;
  region: string; vcpu: number; memoryGb: number; utilizationPct: number; autoscaling: boolean;
  monthlyCostUsd: number; createdAt: string;
}

export interface NetworkTopology {
  id: string; organizationId: string; name: string; cidr: string; region: string; subnetCount: number;
  peeredWith: string[]; latencyMsEstimate: number; throughputGbps: number; monthlyCostUsd: number; createdAt: string;
}

export interface IdentityRole {
  id: string; organizationId: string; name: string; permissions: string[]; mfaRequired: boolean;
  ssoProvider?: string; memberCount: number; riskScore: number; riskFactors: string[]; createdAt: string;
}

export type MonitorStatus = "healthy" | "degraded" | "critical";
export interface Monitor {
  id: string; organizationId: string; serviceName: string; metric: string; thresholdWarning: number;
  thresholdCritical: number; status: MonitorStatus; uptimePct: number; incidentsLast30d: number;
  alertChannels: string[]; createdAt: string;
}

export type ApiAuthType = "api-key" | "oauth2" | "mtls";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface ApiEndpoint {
  id: string; organizationId: string; name: string; method: HttpMethod; path: string; authType: ApiAuthType;
  rateLimitPerMin: number; monthlyCalls: number; avgLatencyMs: number; errorRatePct: number; createdAt: string;
}
