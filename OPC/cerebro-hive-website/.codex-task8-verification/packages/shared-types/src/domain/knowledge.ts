// ── Knowledge / RAG domain types ──────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type CollectionId = string & { readonly __brand: "CollectionId" };
export type DocumentId   = string & { readonly __brand: "DocumentId" };
export type ChunkId      = string & { readonly __brand: "ChunkId" };

export type ChunkingStrategy = "fixed" | "semantic" | "hierarchical" | "markdown" | "code";
export type DocumentStatus   = "pending" | "processing" | "ready" | "failed" | "deleted";
export type SourceType       = "file" | "url" | "api" | "database" | "manual" | "github" | "confluence" | "notion";

export interface KnowledgeCollection {
  id:               CollectionId;
  orgId:            OrgId;
  name:             string;
  description:      string;
  embeddingModel:   string;       // e.g. "text-embedding-3-large"
  embeddingDim:     number;       // 1536, 3072, etc.
  chunkingStrategy: ChunkingStrategy;
  chunkSize:        number;
  chunkOverlap:     number;
  isPublic:         boolean;      // accessible to all org members
  tags:             string[];
  documentCount:    number;
  chunkCount:       number;
  totalTokens:      number;
  createdBy:        UserId;
  createdAt:        string;
  updatedAt:        string;
}

export interface KnowledgeDocument {
  id:            DocumentId;
  collectionId:  CollectionId;
  orgId:         OrgId;
  title:         string;
  sourceUrl:     string | null;
  sourceType:    SourceType;
  mimeType:      string | null;
  contentHash:   string;
  charCount:     number;
  chunkCount:    number;
  status:        DocumentStatus;
  error:         string | null;
  metadata:      Record<string, unknown>;
  tags:          string[];
  uploadedBy:    UserId;
  createdAt:     string;
  updatedAt:     string;
  indexedAt:     string | null;
}

export interface RetrievedDocument {
  chunkId:       ChunkId;
  documentId:    DocumentId;
  collectionId:  CollectionId;
  documentTitle: string;
  content:       string;
  metadata:      Record<string, unknown>;
  vectorScore:   number;
  bm25Score:     number;
  fusedScore:    number;
  rerankedScore: number | null;
}

export interface RetrievalRequest {
  collectionIds: CollectionId[];
  query:         string;
  topK?:         number;
  mode?:         "vector" | "bm25" | "hybrid" | "reranked";
  metadataFilter?: Record<string, unknown>;
  minScore?:     number;
}

export interface RetrievalResponse {
  results:    RetrievedDocument[];
  totalFound: number;
  latencyMs:  number;
  mode:       "vector" | "bm25" | "hybrid" | "reranked";
}
