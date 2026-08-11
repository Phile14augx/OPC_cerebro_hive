// ── API response shapes ───────────────────────────────────────────────────────

import type { AgentDefinition, AgentRun } from "../domain/agent.js";
import type { AuditEvent } from "../domain/audit.js";
import type { UsageBudget } from "../domain/billing.js";
import type { KnowledgeCollection, KnowledgeDocument, RetrievalResponse } from "../domain/knowledge.js";
import type { Organization, OrgUsage } from "../domain/organization.js";
import type { ApiKey, User, UserWithMemberships } from "../domain/user.js";
import type { WorkflowDefinition, WorkflowExecution } from "../domain/workflow.js";
import type { PaginatedResponse } from "./pagination.js";

export interface ApiResponse<T> {
  data:      T;
  requestId: string;
  timestamp: string;
}

// ── Auth responses ────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken:       string;
  refreshToken:      string;
  expiresIn:         number;     // seconds
  tokenType:         "Bearer";
}

export interface LoginResponse extends AuthTokens {
  user: User;
  org:  Organization | null;
}

// ── User responses ────────────────────────────────────────────────────────────
export type GetMeResponse         = ApiResponse<UserWithMemberships>;
export type GetUserResponse       = ApiResponse<User>;
export type ListUsersResponse     = ApiResponse<PaginatedResponse<User>>;

// ── Org responses ─────────────────────────────────────────────────────────────
export type GetOrgResponse        = ApiResponse<Organization>;
export type ListOrgsResponse      = ApiResponse<PaginatedResponse<Organization>>;
export type GetOrgUsageResponse   = ApiResponse<OrgUsage>;

// ── Workflow responses ────────────────────────────────────────────────────────
export type GetWorkflowResponse       = ApiResponse<WorkflowDefinition>;
export type ListWorkflowsResponse     = ApiResponse<PaginatedResponse<WorkflowDefinition>>;
export type GetExecutionResponse      = ApiResponse<WorkflowExecution>;
export type ListExecutionsResponse    = ApiResponse<PaginatedResponse<WorkflowExecution>>;
export type ExecuteWorkflowResponse   = ApiResponse<WorkflowExecution>;

// ── Agent responses ───────────────────────────────────────────────────────────
export type GetAgentResponse      = ApiResponse<AgentDefinition>;
export type ListAgentsResponse    = ApiResponse<PaginatedResponse<AgentDefinition>>;
export type GetAgentRunResponse   = ApiResponse<AgentRun>;

// ── Knowledge responses ───────────────────────────────────────────────────────
export type GetCollectionResponse     = ApiResponse<KnowledgeCollection>;
export type ListCollectionsResponse   = ApiResponse<PaginatedResponse<KnowledgeCollection>>;
export type GetDocumentResponse       = ApiResponse<KnowledgeDocument>;
export type ListDocumentsResponse     = ApiResponse<PaginatedResponse<KnowledgeDocument>>;
export type SearchKnowledgeResponse   = ApiResponse<RetrievalResponse>;

// ── API Key responses ─────────────────────────────────────────────────────────
export interface CreateApiKeyResponse {
  apiKey:    ApiKey;
  plaintext: string;    // ONLY returned once on creation — never again
}

export type ListApiKeysResponse = ApiResponse<PaginatedResponse<ApiKey>>;

// ── Audit responses ───────────────────────────────────────────────────────────
export type ListAuditEventsResponse = ApiResponse<PaginatedResponse<AuditEvent>>;

// ── Budget responses ──────────────────────────────────────────────────────────
export type GetBudgetResponse    = ApiResponse<UsageBudget>;

// ── Health response ───────────────────────────────────────────────────────────
export interface HealthCheck {
  status:    "ok" | "degraded" | "unhealthy";
  version:   string;
  uptime:    number;
  timestamp: string;
  checks: {
    database:  "ok" | "error";
    redis:     "ok" | "error";
    nats:      "ok" | "error";
    aiGateway: "ok" | "error";
  };
}
