/**
 * HiveSwarm MemoryClient
 *
 * Typed HTTP client for the memory-service REST API.
 * Agents use this to read/write all four memory tiers.
 */
import type {
  MemoryEntry,
  MemorySearchResult,
  SearchMemoryRequest,
  StoreMemoryRequest,
  StoreMemoryResponse,
} from "../types/memory.js";

export interface MemoryClientOptions {
  baseUrl: string;          // e.g. "http://memory-service:8930"
  timeoutMs?: number;       // default 10_000
}

export class MemoryClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: MemoryClientOptions) {
    this.baseUrl   = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  async store(req: StoreMemoryRequest): Promise<StoreMemoryResponse> {
    return this.post<StoreMemoryResponse>("/api/v1/memory/store", req);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async list(agentId: string, tier?: string): Promise<MemoryEntry[]> {
    const qs = tier ? `?tier=${encodeURIComponent(tier)}` : "";
    return this.get<MemoryEntry[]>(`/api/v1/memory/${encodeURIComponent(agentId)}${qs}`);
  }

  async search(req: SearchMemoryRequest): Promise<MemorySearchResult[]> {
    return this.post<MemorySearchResult[]>("/api/v1/memory/search", req);
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async deleteAll(agentId: string): Promise<void> {
    await this.delete(`/api/v1/memory/${encodeURIComponent(agentId)}`);
  }

  async deleteKey(agentId: string, key: string): Promise<void> {
    await this.delete(
      `/api/v1/memory/${encodeURIComponent(agentId)}/${encodeURIComponent(key)}`
    );
  }

  // ── Health ─────────────────────────────────────────────────────────────────

  async health(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/health");
  }

  // ── HTTP helpers ───────────────────────────────────────────────────────────

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

  private async delete(path: string): Promise<void> {
    await this.fetch(path, { method: "DELETE" });
  }

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.baseUrl + path, {
        ...init,
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`memory-service ${init.method ?? "GET"} ${path} → ${res.status}: ${body}`);
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }
}
