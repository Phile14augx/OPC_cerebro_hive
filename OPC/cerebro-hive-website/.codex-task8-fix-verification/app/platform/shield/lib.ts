// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";






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
