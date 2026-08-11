// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type AgentStatus = "active" | "inactive" | "suspended";
export type Agent = { id: string; slug: string; name: string; description: string; status: AgentStatus; model: string; created_at: string };
export type RunOut = { run_id: string; status: string; output?: string; error?: string };
