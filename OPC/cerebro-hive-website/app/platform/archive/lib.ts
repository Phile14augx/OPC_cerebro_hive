// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";






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
