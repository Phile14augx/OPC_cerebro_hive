// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";






// ---------------- Agent Mesh ----------------

export interface MeshAgent {
  id: string; organizationId: string; name: string;
  kind: "internal" | "external"; capabilities: string[]; endpoint?: string;
  status: "online" | "offline" | "degraded"; lastHeartbeatAt?: string; metadata: Record<string, unknown>;
}
export interface DiscoverHit { agent: MeshAgent; score: number }
export interface VoteResult { winner: string; tally: Record<string, number>; voters: number }

// ---------------- Runtime ----------------

export type ExecutionStatus = "queued" | "planning" | "running" | "waiting" | "tool_call" | "completed" | "failed" | "cancelled" | "timed_out";
export interface Execution {
  id: string; organizationId: string; workspaceId?: string; agentId?: string;
  goal: string; status: ExecutionStatus; input: Record<string, unknown>;
  result?: { output: string; verification: { ok: boolean; score: number; issues: string[] } };
  error?: string; attempts: number; maxAttempts: number; queuedAt: string; startedAt?: string; finishedAt?: string;
}
export interface ToolDefinition { name: string; description: string }
