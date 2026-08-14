/**
 * CerebroHive — Typed API client for platform-api service
 * All methods are strongly typed against the @cerebro/shared-types contracts.
 */

"use client";

const RAW_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3406";
const BASE = RAW_BASE.replace(/\/api\/v1\/?$/, "");

// ── Auth token provider (injected at runtime) ─────────────────────────────────
let _getToken: (() => Promise<string | null>) | null = null;

export function configurePlatformApiToken(fn: () => Promise<string | null>): void {
  _getToken = fn;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = _getToken ? await _getToken() : null;
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    "X-Trace-ID": `studio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchInit } = init;
  const headers = skipAuth ? { "Content-Type": "application/json" } : await getAuthHeaders();

  const res = await fetch(`${BASE}${path}`, {
    ...fetchInit,
    headers: { ...headers, ...(fetchInit.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText })) as { message?: string; error?: string };
    throw Object.assign(
      new Error(body.message ?? `platform-api ${res.status}`),
      { status: res.status, code: body.error },
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

function get<T>(path: string)  { return request<T>(path, { method: "GET" }); }
function del<T>(path: string)  { return request<T>(path, { method: "DELETE" }); }
function post<T>(path: string, body?: unknown) {
  return request<T>(path, { method: "POST",  body: body !== undefined ? JSON.stringify(body) : undefined });
}
function patch<T>(path: string, body?: unknown) {
  return request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> { items: T[]; total: number; page?: number; limit?: number; }

export interface Me {
  id:          string;
  email:       string;
  name:        string;           // display name (alias for displayName)
  displayName: string;
  avatarUrl:   string | null;
  status:      string;
  orgId:       string | null;
  orgRole:     string | null;
  isAdmin:     boolean;
  authType:    string;
}

export interface Workflow {
  id:           string;
  orgId:        string;
  name:         string;
  description:  string | null;
  status:       "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version:      number;
  definition:   unknown;
  tags:         string[];
  createdById:  string;
  updatedById:  string;
  publishedAt:  string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface WorkflowExecution {
  id:                 string;
  workflowId:         string;
  orgId:              string;
  status:             "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  triggerType:        string;
  input:              unknown;
  output:             unknown;
  stepExecutions:     unknown;
  error:              unknown;
  durationMs:         number | null;
  totalTokensUsed:    number | null;
  totalCostUsd:       string | null;
  startedAt:          string | null;
  completedAt:        string | null;
  testMode:           boolean;
  temporalWorkflowId: string | null;
  createdAt:          string;
  updatedAt:          string;
}

export interface Agent {
  id:            string;
  orgId:         string;
  name:          string;
  slug:          string;
  description:   string | null;
  status:        string;
  version:       string;
  model:         string;           // primary model identifier
  modelId:       string | null;
  instructions:  string | null;
  tools:         string[] | null;
  totalRuns:     number;
  successfulRuns: number;
  failedRuns:    number;
  createdAt:     string;
  updatedAt:     string;
}

export interface AgentRun {
  id:            string;
  agentId:       string;
  orgId:         string;
  status:        "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  input:         unknown;
  output:        unknown;
  durationMs:    number | null;
  totalTokens:   number | null;
  costUsd:       string | null;
  modelId:       string;
  startedAt:     string;
  completedAt:   string | null;
}

export interface KnowledgeCollection {
  id:               string;
  orgId:            string;
  name:             string;
  description:      string | null;
  documentCount:    number;
  embeddingModel:   string;
  chunkingStrategy: string;
  dimensions:       number | null;
  createdAt:        string;
  updatedAt:        string;
}

export interface KnowledgeDocument {
  id:           string;
  collectionId: string;
  orgId:        string;
  title:        string;           // display title
  name:         string;           // file/source name
  sourceType:   string;
  sourceUrl:    string | null;
  mimeType:     string | null;
  status:       "PENDING" | "PROCESSING" | "INDEXED" | "FAILED";
  chunkCount:   number | null;
  sizeBytes:    number | null;
  indexedAt:    string | null;
  createdAt:    string;
  updatedAt:    string;
}

export interface AIUsageSummary {
  period:                 { from: string; to: string };
  totalTokens:            number;
  totalPromptTokens:      number;
  totalCompletionTokens:  number;
  totalCostUsd:           number;
  totalRequests:          number;
  requestCount:           number;    // alias for totalRequests
  avgLatencyMs:           number | null;
  cacheHitRate:           number;
}

export interface AdminStats {
  orgs:       number;
  users:      number;
  workflows:  { total: number; published: number; draft: number; archived: number };
  executions: { total: number; running: number; completed: number; failed: number };
  agents:     { total: number; active: number };
  timestamp:  string;
}

export interface ApiKey {
  id:          string;
  name:        string;
  prefix:      string;
  permissions: string[];
  expiresAt:   string | null;
  lastUsedAt:  string | null;
  createdAt:   string;
}

// ── Prompt Registry ───────────────────────────────────────────────────────────

export interface PromptVersionMetrics {
  successRate:  number;
  avgTokens:    number;
  avgLatencyMs: number;
  runs:         number;
}

export interface PromptVersion {
  id:          string;
  promptId:    string;
  orgId:       string;
  version:     number;
  content:     string;
  model:       string;
  variables:   string[];
  description: string;
  changelog:   string;
  contentHash: string;
  tags:        string[];
  isActive:    boolean;
  createdBy:   string | null;
  metrics:     PromptVersionMetrics | null;
  createdAt:   string;
}

export interface Prompt {
  id:            string;
  orgId:         string;
  name:          string;
  slug:          string;
  description:   string;
  status:        "DRAFT" | "PUBLISHED" | "DEPRECATED";
  category:      string;
  tags:          string[];
  activeVersion: number;
  createdById:   string | null;
  updatedById:   string | null;
  createdAt:     string;
  updatedAt:     string;
  versions:      PromptVersion[];
}

// ── LLM Evaluations ───────────────────────────────────────────────────────────

export interface EvalDataset {
  id:          string;
  orgId:       string;
  name:        string;
  description: string;
  rowCount:    number;
  sourceType:  string;
  createdAt:   string;
  updatedAt:   string;
}

export type EvalMetrics = {
  accuracy?:         number;
  faithfulness?:     number;
  answer_relevance?: number;
  context_recall?:   number;
  toxicity?:         number;
  latency_p50?:      number;
  [key: string]:     number | undefined;
};

export interface EvalRun {
  id:           string;
  orgId:        string;
  name:         string;
  promptId:     string | null;
  promptSlug:   string;
  datasetId:    string | null;
  model:        string;
  status:       "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  samples:      number;
  passed:       number;
  metrics:      EvalMetrics;
  errorMsg:     string | null;
  startedAt:    string | null;
  completedAt:  string | null;
  dataset:      EvalDataset | null;
}

// ── Distributed Traces ────────────────────────────────────────────────────────

export interface TempoSpanAttribute {
  key:   string;
  value: { stringValue?: string; intValue?: number; boolValue?: boolean };
}

export interface TempoSpan {
  traceId:      string;
  spanId:       string;
  parentSpanId: string | null;
  name:         string;
  kind:         number;
  startTimeUnixNano: string;
  endTimeUnixNano:   string;
  attributes:   TempoSpanAttribute[];
  status:       { code: number; message?: string };
}

export interface TempoTrace {
  traceID:          string;
  rootServiceName:  string;
  rootTraceName:    string;
  startTimeUnixNano: string;
  durationMs:       number;
  spanSets:         { spans: TempoSpan[]; matched: number }[];
}

export interface TempoSearchResult {
  traces:  TempoTrace[];
  metrics: { inspectedTraces: number; inspectedBytes: number };
}

// ── Model Catalog ─────────────────────────────────────────────────────────────

export interface ModelEntry {
  id:               string;
  provider:         string;
  name:             string;
  description:      string;
  contextWindow:    number;
  maxOutput?:       number | null;
  inputPricePer1M:  number;
  outputPricePer1M: number;
  capabilities:     string[];
  status:           "ACTIVE" | "PREVIEW" | "DEPRECATED";
  metadata:         Record<string, unknown>;
  available:        boolean;
  latencyMs:        number | null;
  addedAt:          string;
  updatedAt:        string;
}

// ── NATS Event Stream ─────────────────────────────────────────────────────────

export interface NatsEvent {
  id:        string;
  subject:   string;
  domain:    string;
  payload:   Record<string, unknown>;
  timestamp: number;
  sequence:  number;
}

// ── API namespace ─────────────────────────────────────────────────────────────

export const platformApi = {
  auth: {
    me: () => get<Me>("/api/v1/auth/me"),
    logout: (refreshToken: string) => post<{ success: boolean }>("/api/v1/auth/logout", { refresh_token: refreshToken }),
  },

  workflows: {
    list: (params: { page?: number; limit?: number; status?: string; search?: string; tags?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.page)   q.set("page",   String(params.page));
      if (params.limit)  q.set("limit",  String(params.limit));
      if (params.status) q.set("status", params.status);
      if (params.search) q.set("search", params.search);
      if (params.tags)   q.set("tags",   params.tags);
      return get<PaginatedResponse<Workflow>>(`/api/v1/workflows?${q}`);
    },
    get:     (id: string)                      => get<Workflow>(`/api/v1/workflows/${id}`),
    create:  (body: { name: string; description?: string; definition?: unknown; tags?: string[] }) =>
      post<Workflow>("/api/v1/workflows", body),
    update:  (id: string, body: Partial<Workflow>) => patch<Workflow>(`/api/v1/workflows/${id}`, body),
    publish: (id: string)                       => post<Workflow>(`/api/v1/workflows/${id}/publish`),
    delete:  (id: string)                       => del<void>(`/api/v1/workflows/${id}`),
    execute: (id: string, body: { input?: unknown; testMode?: boolean }) =>
      post<WorkflowExecution>(`/api/v1/workflows/${id}/execute`, body),
    executions: (id: string, params: { page?: number; limit?: number; status?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.page)   q.set("page",   String(params.page));
      if (params.limit)  q.set("limit",  String(params.limit));
      if (params.status) q.set("status", params.status);
      return get<PaginatedResponse<WorkflowExecution>>(`/api/v1/workflows/${id}/executions?${q}`);
    },
    getExecution:    (execId: string) => get<WorkflowExecution>(`/api/v1/workflows/executions/${execId}`),
    cancelExecution: (execId: string) => post<void>(`/api/v1/workflows/executions/${execId}/cancel`),
    archive:         (id: string)     => post<Workflow>(`/api/v1/workflows/${id}/archive`),
  },

  agents: {
    list: (params: { page?: number; limit?: number; search?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.page)   q.set("page",   String(params.page));
      if (params.limit)  q.set("limit",  String(params.limit));
      if (params.search) q.set("search", params.search);
      return get<PaginatedResponse<Agent>>(`/api/v1/agents?${q}`);
    },
    get:    (id: string)                        => get<Agent>(`/api/v1/agents/${id}`),
    create: (body: { name: string; slug?: string; description?: string; model?: string; instructions?: string; tools?: string[] }) =>
      post<Agent>("/api/v1/agents", body),
    update: (id: string, body: Partial<Agent>) => patch<Agent>(`/api/v1/agents/${id}`, body),
    delete: (id: string)                        => del<void>(`/api/v1/agents/${id}`),
    run:    (id: string, body: { input?: unknown }) => post<AgentRun>(`/api/v1/agents/${id}/run`, body),
    runs:   (id: string, params: { page?: number; limit?: number } = {}) => {
      const q = new URLSearchParams();
      if (params.page)  q.set("page",  String(params.page));
      if (params.limit) q.set("limit", String(params.limit));
      return get<PaginatedResponse<AgentRun>>(`/api/v1/agents/${id}/runs?${q}`);
    },
  },

  knowledge: {
    collections: {
      list:   (params: { page?: number; limit?: number } = {}) => {
        const q = new URLSearchParams();
        if (params.page)  q.set("page",  String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        return get<PaginatedResponse<KnowledgeCollection>>(`/api/v1/knowledge/collections?${q}`);
      },
      get:    (id: string)                    => get<KnowledgeCollection>(`/api/v1/knowledge/collections/${id}`),
      create: (body: { name: string; description?: string; embeddingModel?: string }) =>
        post<KnowledgeCollection>("/api/v1/knowledge/collections", body),
      delete: (id: string)                    => del<void>(`/api/v1/knowledge/collections/${id}`),
    },
    documents: {
      list:   (collectionId: string, params: { page?: number; limit?: number; status?: string } = {}) => {
        const q = new URLSearchParams();
        if (params.page)   q.set("page",   String(params.page));
        if (params.limit)  q.set("limit",  String(params.limit));
        if (params.status) q.set("status", params.status);
        return get<PaginatedResponse<KnowledgeDocument>>(
          `/api/v1/knowledge/collections/${collectionId}/documents?${q}`
        );
      },
      create: (collectionId: string, body: { title?: string; name?: string; content?: string; sourceType?: string; sourceUrl?: string; mimeType?: string }) =>
        post<KnowledgeDocument>(`/api/v1/knowledge/collections/${collectionId}/documents`, body),
      upload: (collectionId: string, body: { name: string; sourceType: string; sourceUrl?: string; mimeType?: string }) =>
        post<KnowledgeDocument>(`/api/v1/knowledge/collections/${collectionId}/documents`, body),
      delete: (collectionId: string, docId: string) =>
        del<void>(`/api/v1/knowledge/collections/${collectionId}/documents/${docId}`),
    },
  },

  ai: {
    usage:   (params: { from?: string; to?: string; modelId?: string; provider?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.from)     q.set("from",     params.from);
      if (params.to)       q.set("to",       params.to);
      if (params.modelId)  q.set("modelId",  params.modelId);
      if (params.provider) q.set("provider", params.provider);
      return get<AIUsageSummary>(`/api/v1/ai/usage?${q}`);
    },
  },

  billing: {
    subscription: () => get<unknown>("/api/v1/billing/subscription"),
    budgets:      () => get<{ items: unknown[]; total: number }>("/api/v1/billing/budgets"),
  },

  admin: {
    stats: () => get<AdminStats>("/api/v1/admin/stats"),
  },

  apiKeys: {
    list: () => get<ApiKey[]>("/api/v1/api-keys"),
    create: (body: { name: string; permissions?: string[]; expiresIn?: string }) =>
      post<{ raw: string } & ApiKey>("/api/v1/api-keys", body),
    revoke: (id: string) => del<void>(`/api/v1/api-keys/${id}`),
  },

  prompts: {
    list: (params: { page?: number; limit?: number; status?: string; category?: string; search?: string; tags?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.page)     q.set("page",     String(params.page));
      if (params.limit)    q.set("limit",    String(params.limit));
      if (params.status)   q.set("status",   params.status);
      if (params.category) q.set("category", params.category);
      if (params.search)   q.set("search",   params.search);
      if (params.tags)     q.set("tags",     params.tags);
      return get<PaginatedResponse<Prompt>>(`/api/v1/prompts?${q}`);
    },
    get:         (id: string) => get<Prompt>(`/api/v1/prompts/${id}`),
    create:      (body: { name: string; slug?: string; description?: string; category?: string; tags?: string[]; content: string; model: string; variables?: string[] }) =>
      post<Prompt>("/api/v1/prompts", body),
    update:      (id: string, body: Partial<Pick<Prompt, "name" | "description" | "category" | "tags" | "status">>) =>
      patch<Prompt>(`/api/v1/prompts/${id}`, body),
    publish:     (id: string) => post<Prompt>(`/api/v1/prompts/${id}/publish`),
    deprecate:   (id: string) => post<Prompt>(`/api/v1/prompts/${id}/deprecate`),
    delete:      (id: string) => del<void>(`/api/v1/prompts/${id}`),
    versions: {
      list:     (promptId: string) => get<PaginatedResponse<PromptVersion>>(`/api/v1/prompts/${promptId}/versions`),
      create:   (promptId: string, body: { content: string; model: string; variables?: string[]; description?: string; changelog?: string }) =>
        post<PromptVersion>(`/api/v1/prompts/${promptId}/versions`, body),
      activate: (promptId: string, version: number) =>
        post<{ promptId: string; activeVersion: number }>(`/api/v1/prompts/${promptId}/versions/${version}/activate`),
    },
  },

  evaluations: {
    datasets: {
      list:   () => get<PaginatedResponse<EvalDataset>>("/api/v1/evaluations/datasets"),
      get:    (id: string) => get<EvalDataset>(`/api/v1/evaluations/datasets/${id}`),
      create: (body: { name: string; description?: string; rowCount?: number; sourceType?: string }) =>
        post<EvalDataset>("/api/v1/evaluations/datasets", body),
      delete: (id: string) => del<void>(`/api/v1/evaluations/datasets/${id}`),
    },
    runs: {
      list: (params: { page?: number; limit?: number; status?: string; promptId?: string } = {}) => {
        const q = new URLSearchParams();
        if (params.page)     q.set("page",     String(params.page));
        if (params.limit)    q.set("limit",    String(params.limit));
        if (params.status)   q.set("status",   params.status);
        if (params.promptId) q.set("promptId", params.promptId);
        return get<PaginatedResponse<EvalRun>>(`/api/v1/evaluations/runs?${q}`);
      },
      get:    (id: string) => get<EvalRun>(`/api/v1/evaluations/runs/${id}`),
      create: (body: { name: string; promptId?: string; promptSlug?: string; datasetId?: string; model: string }) =>
        post<EvalRun>("/api/v1/evaluations/runs", body),
      cancel: (id: string) => post<EvalRun>(`/api/v1/evaluations/runs/${id}/cancel`),
      delete: (id: string) => del<void>(`/api/v1/evaluations/runs/${id}`),
    },
  },

  traces: {
    search: (params: { q?: string; serviceName?: string; tags?: string; minDuration?: string; maxDuration?: string; limit?: number; start?: string; end?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.q)           q.set("q",           params.q);
      if (params.serviceName) q.set("serviceName", params.serviceName);
      if (params.tags)        q.set("tags",        params.tags);
      if (params.minDuration) q.set("minDuration", params.minDuration);
      if (params.maxDuration) q.set("maxDuration", params.maxDuration);
      if (params.limit)       q.set("limit",       String(params.limit));
      if (params.start)       q.set("start",       params.start);
      if (params.end)         q.set("end",         params.end);
      return get<TempoSearchResult>(`/api/v1/traces?${q}`);
    },
    get:     (traceId: string) => get<{ batches: unknown[] }>(`/api/v1/traces/${traceId}`),
    tags:    ()                 => get<{ tagNames: string[] }>("/api/v1/traces/meta/tags"),
    tagValues: (tagName: string) => get<{ tagValues: string[] }>(`/api/v1/traces/meta/tags/${tagName}/values`),
  },

  models: {
    list: (params: { provider?: string; status?: string; capability?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.provider)   q.set("provider",   params.provider);
      if (params.status)     q.set("status",     params.status);
      if (params.capability) q.set("capability", params.capability);
      return get<PaginatedResponse<ModelEntry>>(`/api/v1/models?${q}`);
    },
    get: (id: string) => get<ModelEntry>(`/api/v1/models/${id}`),
    invalidateCache: () => post<{ invalidated: boolean }>("/api/v1/models/cache/invalidate", {}),
  },
};
