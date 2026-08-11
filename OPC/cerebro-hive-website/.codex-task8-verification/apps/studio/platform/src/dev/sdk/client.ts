/** Typed TS SDK for the CerebroHive platform API (fetch-based, zero deps). */
export interface SdkOptions { baseUrl: string; apiKey: string; fetchImpl?: typeof fetch }

export class CerebroClient {
  constructor(private readonly opts: SdkOptions) {}
  private get f() { return this.opts.fetchImpl ?? fetch; }

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await this.f(`${this.opts.baseUrl}${path}`, {
      method,
      headers: { "content-type": "application/json", authorization: `Bearer ${this.opts.apiKey}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`api ${res.status}: ${JSON.stringify((json as { error?: unknown }).error ?? json)}`);
    return json as T;
  }

  ai = {
    complete: (messages: { role: string; content: string }[], opts?: { model?: string; provider?: string; useContext?: boolean }) =>
      this.call<{ text: string; provider: string; model: string; costUsd: number }>("POST", "/v1/ai/complete", { messages, ...opts }),
    embed: (texts: string[]) => this.call<{ dimensions: number; count: number }>("POST", "/v1/ai/embed", { texts }),
    moe: (task: string, topK?: number) => this.call<{ answer: string; experts: { id: string; score: number }[] }>("POST", "/v1/ai/moe", { task, topK }),
    usage: () => this.call<{ calls: number; costUsd: number }>("GET", "/v1/ai/usage"),
  };
  runtime = {
    run: (goal: string, opts?: { sync?: boolean; input?: Record<string, unknown> }) =>
      this.call<{ id: string; status: string; result?: { output: string } }>("POST", "/v1/runtime/executions", { goal, sync: opts?.sync ?? true, input: opts?.input }),
    get: (id: string) => this.call<{ id: string; status: string; steps: unknown[] }>("GET", `/v1/runtime/executions/${id}`),
    list: () => this.call<unknown[]>("GET", "/v1/runtime/executions"),
    cancel: (id: string) => this.call<{ status: string }>("POST", `/v1/runtime/executions/${id}/cancel`),
  };
  memory = {
    write: (tier: string, scopeKey: string, content: string) => this.call<{ id: string }>("POST", "/v1/memory/records", { tier, scopeKey, content }),
    search: (query: string, tier?: string) => this.call<{ id: string; content: string; score: number }[]>("POST", "/v1/memory/search", { query, tier }),
  };
  knowledge = {
    ingest: (title: string, content: string, contentType = "text/markdown") => this.call<{ document: { id: string }; chunks: number }>("POST", "/v1/knowledge/documents", { title, content, contentType }),
    search: (query: string) => this.call<{ hits: unknown[]; citations: unknown[] }>("POST", "/v1/knowledge/search", { query }),
    answer: (question: string) => this.call<{ answer: string; citations: unknown[] }>("POST", "/v1/knowledge/answer", { question }),
  };
  mesh = {
    agents: () => this.call<unknown[]>("GET", "/v1/mesh/agents"),
    delegate: (task: string) => this.call<{ agent: { name: string }; result: string }>("POST", "/v1/mesh/delegate", { task }),
    vote: (question: string, options: string[]) => this.call<{ winner: string }>("POST", "/v1/mesh/vote", { question, options }),
  };
  flow = {
    create: (name: string, definition: unknown) => this.call<{ id: string }>("POST", "/v1/flow/workflows", { name, definition }),
    run: (id: string, input?: Record<string, unknown>) => this.call<{ id: string; status: string }>("POST", `/v1/flow/workflows/${id}/run`, { input: input ?? {} }),
  };
  sphere = {
    cockpit: () => this.call<Record<string, unknown>>("GET", "/v1/sphere/cockpit"),
    search: (query: string) => this.call<Record<string, unknown>>("POST", "/v1/sphere/search", { query }),
    timeline: () => this.call<{ entries: unknown[] }>("GET", "/v1/sphere/timeline"),
  };
  simulator = {
    agents: (input: { agents: number; arrivalPerMin: number; serviceTimeSec: number }) => this.call<{ result: Record<string, unknown> }>("POST", "/v1/simulator/agents", input),
  };
  guard = { inspect: (content: string) => this.call<{ riskScore: number; blocked: boolean }>("POST", "/v1/guard/inspect", { content }) };
  hub = { analytics: () => this.call<Record<string, unknown>>("GET", "/v1/hub/analytics"), insights: () => this.call<unknown[]>("POST", "/v1/hub/insights/generate") };
}
