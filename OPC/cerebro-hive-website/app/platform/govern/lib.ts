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

export type PolicyEffect = "allow" | "deny" | "require_approval";
export interface Policy {
  id: string; name: string; description: string; effect: PolicyEffect;
  conditions: Record<string, unknown>; priority: number; enabled: boolean; createdAt: string;
}
export interface PolicyCreate { name: string; description: string; effect: PolicyEffect; conditions: Record<string, unknown>; priority: number }

export type AuditAction = string;
export interface AuditEntry {
  id: string; organizationId: string; actorKind: string; actorId: string;
  action: AuditAction; resourceKind: string; resourceId: string;
  outcome: "allowed" | "denied" | "pending"; details: Record<string, unknown>; createdAt: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export interface Approval {
  id: string; subjectKind: string; subjectId: string;
  requestedBy: string; approverRole: string; status: ApprovalStatus;
  reason?: string; decidedBy?: string; decidedAt?: string; createdAt: string;
}

export interface ComplianceControl { id: string; name: string; evidence: string }
export type CompliancePosture = Record<string, ComplianceControl[]>;
