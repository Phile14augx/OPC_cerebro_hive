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

// ---------------- Governance (approvals + compliance) ----------------

export type ApprovalStatus = "pending" | "approved" | "rejected";
export interface Approval {
  id: string; organizationId: string; subjectKind: string; subjectId: string;
  requestedBy: string; approverRole: string; status: ApprovalStatus;
  reason?: string; decidedBy?: string; decidedAt?: string; createdAt: string;
}

export interface ComplianceControl { id: string; name: string; evidence: string }
export type CompliancePosture = Record<string, ComplianceControl[]>;

// ---------------- Zero Trust (grants, MCP servers, capability tokens) ----------------

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface ToolGrant { id: string; organizationId: string; agentId: string; tool: string; allow: boolean; grantedBy: string; grantedAt: string }

export interface McpServerRegistration {
  id: string; organizationId: string; name: string; url: string; riskTier: RiskTier;
  status: "pending" | "approved" | "denied"; capabilities: string[]; reviewedBy?: string; registeredAt: string; reviewedAt?: string;
}

export interface CapabilityToken { id: string; organizationId: string; agentId: string; tools: string[]; issuedAt: string; expiresAt: string; revoked: boolean }
