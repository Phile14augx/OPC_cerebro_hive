// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";






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
