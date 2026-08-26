/**
 * CerebroHive Studio — platform-api React hooks
 * All hooks follow the pattern: { data, loading, error, refresh }
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { platformApi } from "./api-client";
import type {
  Workflow, WorkflowExecution, Agent, AgentRun,
  KnowledgeCollection, KnowledgeDocument, AIUsageSummary, Me, AdminStats,
  Prompt, EvalRun, EvalDataset, TempoSearchResult, ModelEntry, NatsEvent,
  PaginatedResponse,
} from "./api-client";

// ── Generic paginated hook factory ────────────────────────────────────────────

interface PaginatedState<T> {
  items:    T[];
  total:    number;
  page:     number;
  loading:  boolean;
  error:    string | null;
  hasMore:  boolean;
}

function usePaginatedFetch<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  limit  = 20,
  deps:  unknown[] = [],
) {
  const [state, setState] = useState<PaginatedState<T>>({
    items: [], total: 0, page: 1, loading: true, error: null, hasMore: false,
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async (page: number) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetcherRef.current(page, limit);
      setState({
        items:   res.items,
        total:   res.total,
        page,
        loading: false,
        error:   null,
        hasMore: res.items.length === limit && page * limit < res.total,
      });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load",
      }));
    }
  }, [limit]);

  useEffect(() => { void load(1); }, [load, ...deps]);

  const nextPage = useCallback(() => {
    if (state.hasMore && !state.loading) void load(state.page + 1);
  }, [state, load]);

  const refresh = useCallback(() => load(state.page), [load, state.page]);

  return { ...state, nextPage, refresh };
}

// ── Current user ──────────────────────────────────────────────────────────────

export function useMe() {
  const [me, setMe]         = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await platformApi.auth.me();
        setMe(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Auth failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { me, loading, error };
}

// ── Workflows ─────────────────────────────────────────────────────────────────

export function useWorkflows(params: {
  status?: string;
  search?: string;
  tags?:   string;
  limit?:  number;
} = {}) {
  return usePaginatedFetch<Workflow>(
    (page, limit) => platformApi.workflows.list({ page, limit, ...params }),
    params.limit ?? 20,
    [params.status, params.search, params.tags],
  );
}

export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.workflows.get(id);
      setWorkflow(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { const t = setTimeout(() => void refresh(), 0); return () => clearTimeout(t); }, [refresh]);
  return { workflow, loading, error, refresh };
}

export function useWorkflowExecutions(workflowId: string, params: {
  status?: string;
  limit?:  number;
} = {}) {
  return usePaginatedFetch<WorkflowExecution>(
    (page, limit) => platformApi.workflows.executions(workflowId, { page, limit, ...params }),
    params.limit ?? 20,
    [workflowId, params.status],
  );
}

export function useExecution(execId: string) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await platformApi.workflows.getExecution(execId);
      setExecution(data);
      setError(null);

      // Stop polling once terminal
      if (["COMPLETED", "FAILED", "CANCELLED"].includes(data.status)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load execution");
    } finally {
      setLoading(false);
    }
  }, [execId]);

  useEffect(() => {
    setTimeout(() => void refresh(), 0);
    // Poll active executions every 3 seconds
    intervalRef.current = setInterval(() => void refresh(), 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [refresh]);

  return { execution, loading, error, refresh };
}

// ── Execute workflow action ───────────────────────────────────────────────────

export function useExecuteWorkflow() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<WorkflowExecution | null>(null);

  const execute = useCallback(async (
    workflowId: string,
    input: Record<string, unknown> = {},
    testMode = false,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const exec = await platformApi.workflows.execute(workflowId, { input, testMode });
      setResult(exec);
      return exec;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Execution failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error, result };
}

// ── Agents ────────────────────────────────────────────────────────────────────

export function useAgents(params: { search?: string; limit?: number } = {}) {
  return usePaginatedFetch<Agent>(
    (page, limit) => platformApi.agents.list({ page, limit, ...params }),
    params.limit ?? 20,
    [params.search],
  );
}

export function useAgent(id: string) {
  const [agent, setAgent]   = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.agents.get(id);
      setAgent(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { const t = setTimeout(() => void refresh(), 0); return () => clearTimeout(t); }, [refresh]);
  return { agent, loading, error, refresh };
}

export function useAgentRuns(agentId: string) {
  return usePaginatedFetch<AgentRun>(
    (page, limit) => platformApi.agents.runs(agentId, { page, limit }),
    10,
    [agentId],
  );
}

// ── Knowledge ─────────────────────────────────────────────────────────────────

export function useCollections() {
  return usePaginatedFetch<KnowledgeCollection>(
    (page, limit) => platformApi.knowledge.collections.list({ page, limit }),
    20,
  );
}

export function useDocuments(collectionId: string) {
  return usePaginatedFetch<KnowledgeDocument>(
    (page, limit) => platformApi.knowledge.documents.list(collectionId, { page, limit }),
    20,
    [collectionId],
  );
}

// ── AI Usage ──────────────────────────────────────────────────────────────────

export function useAIUsage(params: {
  from?:     string;
  to?:       string;
  modelId?:  string;
  provider?: string;
} = {}) {
  const [usage, setUsage]     = useState<AIUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.ai.usage(params);
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    } finally {
      setLoading(false);
    }
  }, [params.from, params.to, params.modelId, params.provider]);

  useEffect(() => { const t = setTimeout(() => void refresh(), 0); return () => clearTimeout(t); }, [refresh]);
  return { usage, loading, error, refresh };
}

// ── Admin stats ───────────────────────────────────────────────────────────────

export function useAdminStats() {
  const [stats, setStats]     = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await platformApi.admin.stats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { stats, loading, error };
}

// ── SSE execution stream ──────────────────────────────────────────────────────

export interface ExecutionEvent {
  event: string;
  data:  unknown;
}

export function useExecutionStream(executionId: string | null) {
  const [events, setEvents]   = useState<ExecutionEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!executionId) return;
    const base = process.env["NEXT_PUBLIC_FORGE_API_URL"] ?? "http://localhost:4001";
    const es   = new EventSource(`${base}/v1/stream/executions/${executionId}`);

    es.onopen = () => setConnected(true);

    es.addEventListener("message", (e: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(e.data) as unknown;
        setEvents(prev => [...prev, { event: "message", data: parsed }]);
      } catch { /* non-JSON */ }
    });

    const genericHandler = (e: MessageEvent<string>) => {
      try {
        const parsed = JSON.parse(e.data) as unknown;
        setEvents(prev => [...prev, { event: e.type, data: parsed }]);
      } catch { /* ignore */ }
    };

    ["step_completed", "step_failed", "execution_completed", "execution_failed", "heartbeat"].forEach(
      evt => es.addEventListener(evt, genericHandler),
    );

    es.onerror = () => setTimeout(() => setConnected(false), 0);

    return () => {
      es.close();
      setTimeout(() => setConnected(false), 0);
    };
  }, [executionId]);

  return { events, connected };
}

// ── Prompt Registry hooks ────────────────────────────────────────────────────

export function usePrompts(params: { status?: string; category?: string; search?: string } = {}) {
  return usePaginatedFetch<Prompt>(
    (page, limit) => platformApi.prompts.list({ ...params, page, limit }),
    20,
    [params.status, params.category, params.search],
  );
}

export function usePrompt(id: string | null) {
  const [prompt, setPrompt]   = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await platformApi.prompts.get(id);
      setPrompt(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prompt");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);

  return { prompt, loading, error, refresh: load };
}

// ── Evaluation hooks ─────────────────────────────────────────────────────────

export function useEvalRuns(params: { status?: string; promptId?: string } = {}) {
  return usePaginatedFetch<EvalRun>(
    (page, limit) => platformApi.evaluations.runs.list({ ...params, page, limit }),
    20,
    [params.status, params.promptId],
  );
}

export function useEvalDatasets() {
  const [datasets, setDatasets] = useState<EvalDataset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformApi.evaluations.datasets.list();
      setDatasets(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);

  return { datasets, loading, error, refresh: load };
}

// ── Traces hook (Tempo proxy) ─────────────────────────────────────────────────

export function useTraces(params: { q?: string; serviceName?: string; limit?: number } = {}) {
  const [result, setResult]   = useState<TempoSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformApi.traces.search({ ...params, limit: params.limit ?? 50 });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load traces");
    } finally {
      setLoading(false);
    }
  }, [params.q, params.serviceName, params.limit]);

  useEffect(() => { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);

  return { result, loading, error, refresh: load };
}

// ── Model Catalog hook ────────────────────────────────────────────────────────

export function useModels(params: { provider?: string; status?: string; capability?: string } = {}) {
  const [models, setModels]   = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformApi.models.list(params);
      setModels(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, [params.provider, params.status, params.capability]);

  useEffect(() => { const t = setTimeout(() => void load(), 0); return () => clearTimeout(t); }, [load]);

  return { models, loading, error, refresh: load };
}

// ── Real NATS event SSE stream ────────────────────────────────────────────────

const FORGE_BASE = process.env["NEXT_PUBLIC_FORGE_URL"] ?? "http://localhost:4001";

export function useEventStream(params: { domain?: string; search?: string; paused?: boolean } = {}) {
  const [events, setEvents]         = useState<NatsEvent[]>([]);
  const [connected, setConnected]   = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const esRef                       = useRef<EventSource | null>(null);

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (params.paused) {
      esRef.current?.close();
      esRef.current = null;
      setTimeout(() => setConnected(false), 0);
      return;
    }

    const q = new URLSearchParams();
    if (params.domain) q.set("domain", params.domain);
    if (params.search) q.set("search", params.search);

    const url = `${FORGE_BASE}/v1/stream/events?${q}`;
    const es  = new EventSource(url);
    esRef.current = es;

    es.addEventListener("connected", () => {
      setConnected(true);
      setError(null);
    });

    // Domain-typed events (workflow, agent, knowledge, ai, billing, audit, security)
    const DOMAINS = ["workflow", "agent", "knowledge", "ai", "billing", "audit", "security"];
    const handler = (evt: MessageEvent<string>) => {
      try {
        const event = JSON.parse(evt.data) as NatsEvent;
        setEvents(prev => [event, ...prev].slice(0, 500)); // cap at 500
      } catch { /* ignore malformed events */ }
    };

    DOMAINS.forEach(d => es.addEventListener(d, handler));
    es.onmessage = handler; // catch-all fallback

    es.onerror = () => {
      setTimeout(() => setConnected(false), 0);
      setError("SSE connection lost — retrying…");
    };

    return () => {
      es.close();
      DOMAINS.forEach(d => es.removeEventListener(d, handler));
      esRef.current = null;
      setTimeout(() => setConnected(false), 0);
    };
  }, [params.paused, params.domain, params.search]);

  return { events, connected, error, clear };
}
