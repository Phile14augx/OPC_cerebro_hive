/**
 * HiveSwarm ToolGatewayClient
 *
 * Typed HTTP client for the tool-gateway REST API.
 * Agents use this inside their execute() method to invoke external tools.
 */
import type { ToolCall, ToolDefinition, ToolResult } from "../types/tool.js";

export interface ToolGatewayClientOptions {
  baseUrl:    string;   // e.g. "http://tool-gateway:8940"
  agentId:    string;
  runId?:     string;
  timeoutMs?: number;   // default 35_000 (tools can take up to 30s)
}

export class ToolGatewayClient {
  private readonly baseUrl:   string;
  private readonly agentId:   string;
  private readonly runId:     string;
  private readonly timeoutMs: number;

  constructor(options: ToolGatewayClientOptions) {
    this.baseUrl   = options.baseUrl.replace(/\/$/, "");
    this.agentId   = options.agentId;
    this.runId     = options.runId ?? "";
    this.timeoutMs = options.timeoutMs ?? 35_000;
  }

  // ── Discovery ──────────────────────────────────────────────────────────────

  async listTools(): Promise<ToolDefinition[]> {
    return this.get<ToolDefinition[]>("/api/v1/tools");
  }

  async getTool(toolId: string): Promise<ToolDefinition> {
    return this.get<ToolDefinition>(`/api/v1/tools/${encodeURIComponent(toolId)}`);
  }

  // ── Execution ──────────────────────────────────────────────────────────────

  /**
   * Execute a tool call and return the result.
   * Throws if the HTTP request itself fails; ToolResult.isError handles
   * tool-level errors (auth missing, rate limit, execution error, etc.).
   */
  async execute(toolId: string, input: Record<string, unknown>, callId?: string): Promise<ToolResult> {
    const call: Omit<ToolCall, "callId"> & { callId?: string } = {
      toolId,
      agentId: this.agentId,
      runId:   this.runId || undefined,
      input,
      callId,
    };
    return this.post<ToolResult>(`/api/v1/tools/${encodeURIComponent(toolId)}/execute`, call);
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

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.baseUrl + path, { ...init, signal: controller.signal });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`tool-gateway ${init.method ?? "GET"} ${path} → ${res.status}: ${text}`);
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }
}
