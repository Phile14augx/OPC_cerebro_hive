// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

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
