/**
 * Cerebro SDK™ — the Developer Platform pillar made concrete: a single
 * typed TypeScript client over the entire Cerebro X Enterprise Cognitive OS
 * HTTP surface, usable from any Node/browser/edge runtime. Every domain the
 * platform exposes (AI gateway, AgentOS runtime, Flow, Router, Compiler,
 * Swarm, Actions, DevOps/MLOps/SecOps/AIOps, Digital Twin, Research,
 * Zero Trust, Data Platform) gets one ergonomic method group here instead
 * of hand-rolled fetch calls in every consumer.
 */

export interface CerebroClientOptions { baseUrl: string; apiKey: string; fetchImpl?: typeof fetch }

export class CerebroApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}

async function request<T>(opts: CerebroClientOptions, method: string, path: string, body?: unknown): Promise<T> {
  const doFetch = opts.fetchImpl ?? fetch;
  const res = await doFetch(`${opts.baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json", authorization: `Bearer ${opts.apiKey}` },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const err = (payload as { error?: { code?: string; message?: string } }).error;
    throw new CerebroApiError(res.status, err?.code ?? "unknown", err?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Typed client for the Cerebro X Enterprise Cognitive OS HTTP API. */
export class CerebroClient {
  constructor(private readonly opts: CerebroClientOptions) {}

  private get<T>(path: string) { return request<T>(this.opts, "GET", path); }
  private post<T>(path: string, body?: unknown) { return request<T>(this.opts, "POST", path, body); }

  readonly ai = {
    complete: (body: { messages: { role: string; content: string }[]; model?: string; temperature?: number; maxTokens?: number }) =>
      this.post<{ text: string; model: string; provider: string; costUsd: number }>("/v1/ai/complete", body),
    embed: (texts: string[]) => this.post<{ vectors: number[][]; dimensions: number }>("/v1/ai/embed", { texts }),
  };

  readonly runtime = {
    submit: (goal: string, opts?: { sync?: boolean; input?: Record<string, unknown> }) =>
      this.post<{ id: string; status: string }>("/v1/runtime/executions", { goal, ...opts }),
    get: (id: string) => this.get<{ id: string; status: string }>(`/v1/runtime/executions/${id}`),
  };

  readonly flow = {
    create: (name: string, definition: unknown) => this.post<{ id: string }>("/v1/flow/workflows", { name, definition }),
    run: (workflowId: string, input?: Record<string, unknown>) => this.post<{ id: string; status: string }>(`/v1/flow/workflows/${workflowId}/run`, { input }),
    list: () => this.get<{ id: string; name: string }[]>("/v1/flow/workflows"),
  };

  readonly router = {
    catalog: () => this.get<{ models: { id: string; family: string; quality: number; local: boolean }[] }>("/v1/router/catalog"),
    route: (text: string, constraints?: Record<string, unknown>) => this.post<{ selectedModel: string; rationale: string }>("/v1/router/route", { text, constraints }),
    execute: (messages: { role: string; content: string }[], constraints?: Record<string, unknown>) =>
      this.post<{ decision: unknown; result: { text: string } }>("/v1/router/execute", { messages, constraints }),
  };

  readonly compiler = {
    compile: (goal: string, opts?: { name?: string; deploy?: boolean; execute?: boolean; input?: Record<string, unknown> }) =>
      this.post<{ id: string; workflowId?: string; runId?: string }>("/v1/compiler/compile", { goal, ...opts }),
    programs: () => this.get<{ programs: unknown[] }>("/v1/compiler/programs"),
  };

  readonly swarm = {
    run: (objective: string) => this.post<{ id: string; consensus?: { finalAnswer: string }; status: string }>("/v1/swarm/run", { objective }),
    get: (id: string) => this.get<unknown>(`/v1/swarm/runs/${id}`),
  };

  readonly actions = {
    catalog: () => this.get<{ actions: { kind: string; title: string; requiresApproval: boolean }[] }>("/v1/actions/catalog"),
    execute: (kind: string, params?: Record<string, unknown>, approved?: boolean) =>
      this.post<{ id: string; status: string; result?: Record<string, unknown> }>("/v1/actions/execute", { kind, params, approved }),
    log: () => this.get<{ actions: unknown[] }>("/v1/actions/log"),
  };

  readonly devops = {
    runPipeline: (pipelineName: string, commitSha: string, branch: string) => this.post<{ id: string; status: string }>("/v1/devops/pipelines/run", { pipelineName, commitSha, branch }),
    deploy: (environmentId: string, service: string, version: string) => this.post<{ id: string }>("/v1/devops/deployments", { environmentId, service, version }),
  };

  readonly mlops = {
    startExperiment: (name: string, framework: string) => this.post<{ id: string }>("/v1/mlops/experiments", { name, framework }),
    promote: (modelVersionId: string, targetStage: string) => this.post<{ id: string; stage: string }>(`/v1/mlops/models/${modelVersionId}/promote`, { targetStage }),
  };

  readonly secops = {
    runScan: (kind: string, target: string) => this.post<{ id: string; status: string }>("/v1/secops/scans", { kind, target }),
    redTeam: (targetKind: string, targetId: string) => this.post<{ attacksRun: number; attacksSucceeded: number }>("/v1/secops/redteam", { targetKind, targetId }),
  };

  readonly aiops = {
    detect: (baselines?: Record<string, number>) => this.post<{ anomalies: unknown[]; incidents: unknown[] }>("/v1/aiops/detect", { baselines }),
    incidents: () => this.get<{ incidents: unknown[] }>("/v1/aiops/incidents"),
  };

  readonly digitalTwin = {
    supplyChain: (input: Record<string, unknown>) => this.post<{ id: string; result: Record<string, unknown> }>("/v1/digitaltwin/supply-chain", input),
    hiring: (input: Record<string, unknown>) => this.post<{ id: string; result: Record<string, unknown> }>("/v1/digitaltwin/hiring", input),
    cyberAttack: (input: Record<string, unknown>) => this.post<{ id: string; result: Record<string, unknown> }>("/v1/digitaltwin/cyber-attack", input),
    financialForecast: (input: Record<string, unknown>) => this.post<{ id: string; result: Record<string, unknown> }>("/v1/digitaltwin/financial-forecast", input),
    list: (kind?: string) => this.get<{ runs: unknown[] }>(`/v1/digitaltwin/runs${kind ? `?kind=${kind}` : ""}`),
  };

  readonly research = {
    registerPrompt: (name: string, template: string, notes?: string) => this.post<{ id: string; version: number }>("/v1/research/prompts", { name, template, notes }),
    registerAgent: (name: string, config: Record<string, unknown>, notes?: string) => this.post<{ id: string; version: number }>("/v1/research/agents", { name, config, notes }),
    leaderboard: (suite: string) => this.get<{ entries: unknown[] }>(`/v1/research/leaderboard/${suite}`),
  };

  readonly zeroTrust = {
    grantTool: (agentId: string, tool: string, allow: boolean) => this.post<{ id: string }>("/v1/zerotrust/grants", { agentId, tool, allow }),
    registerMcpServer: (name: string, url: string, riskTier: string, capabilities: string[]) => this.post<{ id: string; status: string }>("/v1/zerotrust/mcp-servers", { name, url, riskTier, capabilities }),
    issueToken: (agentId: string, tools: string[], ttlMinutes?: number) => this.post<{ id: string; expiresAt: string }>("/v1/zerotrust/tokens", { agentId, tools, ttlMinutes }),
  };

  readonly dataPlatform = {
    registerAsset: (input: Record<string, unknown>) => this.post<{ id: string }>("/v1/dataplatform/assets", input),
    lineage: (assetId: string) => this.get<{ upstream: unknown[]; downstream: unknown[] }>(`/v1/dataplatform/lineage/${assetId}`),
    defineMetric: (input: Record<string, unknown>) => this.post<{ id: string }>("/v1/dataplatform/metrics", input),
  };
}

export function createClient(opts: CerebroClientOptions): CerebroClient { return new CerebroClient(opts); }
