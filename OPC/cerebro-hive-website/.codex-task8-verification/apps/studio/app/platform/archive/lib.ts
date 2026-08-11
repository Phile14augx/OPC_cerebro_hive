export const API = process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      authorization: `Bearer ${KEY}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkOnline(): Promise<boolean> {
  try { return await fetch(`${API}/health`).then(r => r.ok); } catch { return false; }
}

// ---------------- Knowledge Fabric ----------------

export type DocContentType = "text/markdown" | "text/plain" | "text/html" | "text/csv" | "text/code";
export interface KnowledgeDocument {
  id: string; organizationId: string; workspaceId?: string; title: string; source: string;
  contentType: DocContentType; status: "uploaded" | "parsed" | "indexed" | "failed";
  rawSize: number; metadata: Record<string, unknown>; createdAt: string;
}
export interface IngestResult { document: KnowledgeDocument; chunks: number; entities: number }
export interface SearchHit { chunkId: string; documentId: string; documentTitle: string; seq: number; text: string; score: number; via: ("vector" | "keyword" | "graph")[] }
export interface SearchResult { hits: SearchHit[]; citations: { documentId: string; title: string; chunkSeq: number }[]; entities: string[] }
export interface AnswerResult { answer: string; citations: SearchResult["citations"] }

// ---------------- Intelligence Hub ----------------

export interface Insight { id: string; organizationId: string; kind: "trend" | "anomaly" | "recommendation" | "forecast" | "relationship"; title: string; body: string; confidence: number; source: string; createdAt: string }
export interface HubAnalytics {
  executions: { total: number; completed: number; failed: number; avgDurationMs: number };
  knowledge: { documents: number; indexed: number };
  ai: { calls: number; costUsd: number; promptTokens: number; completionTokens: number };
  world: Record<string, unknown>;
}
