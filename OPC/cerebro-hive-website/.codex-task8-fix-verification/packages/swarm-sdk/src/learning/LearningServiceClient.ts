/**
 * HiveSwarm LearningServiceClient
 *
 * Typed HTTP client for the learning-service REST API.
 * Agents call this to store replays and retrieve benchmarks.
 * The swarm-runtime calls it after each task completes (via reflect() output).
 */
import type {
  AgentBenchmark,
  OptimizeRequest,
  OptimizeResponse,
  ReplayRecord,
} from "../types/learning.js";

export interface LearningServiceClientOptions {
  baseUrl:    string;   // e.g. "http://learning-service:8950"
  timeoutMs?: number;   // default 30_000
}

export class LearningServiceClient {
  private readonly baseUrl:   string;
  private readonly timeoutMs: number;

  constructor(options: LearningServiceClientOptions) {
    this.baseUrl   = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  // ── Replay ──────────────────────────────────────────────────────────────────

  async storeReplay(replay: ReplayRecord): Promise<{ id: string }> {
    return this.post<{ id: string }>("/replay/store", replay);
  }

  async listReplays(agentId: string, capability?: string, limit = 50): Promise<ReplayRecord[]> {
    const qs = new URLSearchParams({ limit: String(limit) });
    if (capability) qs.set("capability", capability);
    return this.get<ReplayRecord[]>(
      `/replay/${encodeURIComponent(agentId)}?${qs}`
    );
  }

  // ── Benchmarks ──────────────────────────────────────────────────────────────

  async getBenchmark(agentId: string, capability: string): Promise<AgentBenchmark> {
    return this.get<AgentBenchmark>(
      `/benchmarks/${encodeURIComponent(agentId)}?capability=${encodeURIComponent(capability)}`
    );
  }

  // ── Optimisation ─────────────────────────────────────────────────────────────

  async optimizePrompt(req: OptimizeRequest): Promise<OptimizeResponse> {
    return this.post<OptimizeResponse>("/optimize", req);
  }

  // ── Health ───────────────────────────────────────────────────────────────────

  async health(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/health");
  }

  // ── HTTP helpers ─────────────────────────────────────────────────────────────

  private async get<T>(path: string): Promise<T> {
    const res = await this.fetch(path, { method: "GET" });
    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await this.fetch(path, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    return res.json() as Promise<T>;
  }

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.baseUrl + path, { ...init, signal: controller.signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `learning-service ${init.method ?? "GET"} ${path} → ${res.status}: ${text}`
        );
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }
}
