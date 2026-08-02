// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

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
