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

export type AgentStatus = "active" | "inactive" | "suspended";
export interface Agent {
  slug: string; name: string; status: AgentStatus;
  tools: string[]; skills: string[]; model: string;
  maxSteps: number; createdAt: string;
}

export interface ApiKeyInfo { id: string; name: string; createdAt: string; lastUsedAt?: string }
export interface ToolGrant { id: string; agentId: string; tool: string; allow: boolean; grantedBy: string; grantedAt: string }
export type RiskTier = "low" | "medium" | "high" | "critical";
export interface McpServer { id: string; name: string; url: string; riskTier: RiskTier; status: "pending" | "approved" | "denied"; capabilities: string[]; registeredAt: string }
export interface CapabilityToken { id: string; agentId: string; tools: string[]; issuedAt: string; expiresAt: string; revoked: boolean }
