// ── API request shapes ────────────────────────────────────────────────────────

import type { BillingInterval } from "../domain/billing.js";
import type { UserRole } from "../domain/user.js";

// Auth
export interface LoginRequest {
  email:    string;
  password: string;
  mfaCode?: string;
}

export interface RefreshTokenRequest { refreshToken: string }

// Organizations
export interface CreateOrgRequest {
  name:          string;
  slug?:         string;
  billingEmail?: string;
}

export interface UpdateOrgRequest {
  name?:          string;
  billingEmail?:  string;
  settings?:      Record<string, unknown>;
}

// Users
export interface InviteUserRequest {
  email: string;
  role:  UserRole;
}

export interface UpdateMemberRoleRequest { role: UserRole }

// Workflows
export interface CreateWorkflowRequest {
  name:        string;
  description?: string;
  tags?:       string[];
}

export interface UpdateWorkflowRequest {
  name?:        string;
  description?: string;
  steps?:       unknown[];
  variables?:   unknown[];
  triggers?:    unknown[];
  settings?:    Record<string, unknown>;
  tags?:        string[];
}

export interface ExecuteWorkflowRequest {
  input?:    Record<string, unknown>;
  async?:    boolean;
  testMode?: boolean;
}

// AI / Chat
export interface ChatRequest {
  messages:    Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?:      string;
  stream?:     boolean;
  maxTokens?:  number;
  temperature?: number;
  workflowId?: string;
  agentId?:    string;
  sessionId?:  string;
}

// Knowledge
export interface CreateCollectionRequest {
  name:              string;
  description?:      string;
  chunkingStrategy?: string;
  chunkSize?:        number;
  chunkOverlap?:     number;
  tags?:             string[];
}

export interface UploadDocumentRequest {
  title:      string;
  sourceType: string;
  sourceUrl?: string;
  metadata?:  Record<string, unknown>;
  tags?:      string[];
}

export interface SearchKnowledgeRequest {
  query:         string;
  collectionIds?: string[];
  topK?:         number;
  mode?:         "vector" | "bm25" | "hybrid" | "reranked";
}

// API Keys
export interface CreateApiKeyRequest {
  name:       string;
  scopes:     string[];
  expiresAt?: string;
}

// Billing
export interface CreateSubscriptionRequest {
  plan:            string;
  interval:        BillingInterval;
  paymentMethodId: string;
  seats?:          number;
}
