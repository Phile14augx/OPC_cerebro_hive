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

// ---------------- Observatory ----------------

export interface ObservatoryOverview {
  cost: { calls: number; costUsd: number; promptTokens: number; completionTokens: number };
  executions: { total: number; byStatus: Record<string, number>; avgSteps: number };
  counters: Record<string, number>;
  latency: unknown;
  spans: { traceId: string; name: string; durationMs: number; status: string }[];
}

// ---------------- Router (Cerebro Router — model gateway) ----------------

export type Intent = "code" | "analysis" | "research" | "creative" | "support" | "extraction" | "general";
export interface ModelProfile { id: string; family: string; quality: number; speedMsPer1k: number; costPer1kIn: number; costPer1kOut: number; strengths: Intent[]; local: boolean }
export interface RoutingDecision {
  id: string; organizationId: string; intent: Intent; complexity: number; privacyTier: string;
  candidates: { modelId: string; score: number }[]; selectedModel: string; rationale: string;
  predictedCostUsd: number; predictedLatencyMs: number; estimatedTokens: number; decidedAt: string;
}
