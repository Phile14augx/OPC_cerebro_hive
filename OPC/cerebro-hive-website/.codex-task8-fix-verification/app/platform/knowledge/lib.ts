// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type DocContentType = "text/plain" | "text/markdown" | "text/html" | "text/csv" | "text/code";
export interface KnowledgeDocument { id: string; title: string; contentType: DocContentType; chunkCount: number; createdAt: string }
export interface IngestResult { documentId: string; chunkCount: number }
export interface SearchResult { chunkId: string; documentId: string; title: string; content: string; score: number }
export interface AnswerResult { answer: string; citations: Array<{ chunkId: string; title: string; excerpt: string }> }
