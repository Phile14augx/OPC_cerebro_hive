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

export type SwarmAgentRole =
  | "ceo" | "strategy" | "architect" | "planner" | "research"
  | "cloud-architect" | "ai-architect" | "solution-architect" | "reviewer";
export type TaskPriority = "Low" | "Medium" | "High";

export interface SwarmAgentDef { role: SwarmAgentRole; name: string; title: string; responsibility: string; meshAgentId?: string }

export interface SwarmTask {
  id: string; directiveId: string; taskId: string; sender: string; recipient: string; role: SwarmAgentRole;
  objective: string; dependencies: string[]; priority: TaskPriority; deadline: string;
  status: string; output: string; order: number; attempt: number; createdAt: string;
}

export interface Directive {
  id: string; objective: string; priority: TaskPriority; status: string;
  verdict?: "approved" | "max_revisions_reached"; revisions: number; createdAt: string; completedAt?: string;
}
