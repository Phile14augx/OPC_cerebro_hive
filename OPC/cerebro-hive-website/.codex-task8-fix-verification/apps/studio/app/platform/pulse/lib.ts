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
