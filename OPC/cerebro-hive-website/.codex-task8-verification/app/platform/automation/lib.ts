// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "paused";
export type WorkflowOut = { run_id: string; status: WorkflowStatus; definition: Record<string, unknown>; created_at: string; completed_at?: string };
