// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type TraceOut = { trace_id: string; agent_slug: string; run_id: string; steps: number; tokens_in: number; tokens_out: number; latency_ms: number; status: string; created_at: string };
export type MetricOut = { metric: string; value: number; unit: string; window: string };
export type EventOut = { event_id: string; event_type: string; source: string; payload: Record<string, unknown>; created_at: string };
