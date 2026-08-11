/**
 * HiveSwarm — Memory Types
 *
 * Mirrors the Go types in services/memory-service/internal/store/types.go.
 * These types are used by agents to read/write memory via MemoryClient.
 */

export type MemoryTier = "working" | "semantic" | "long_term" | "execution";

export interface MemoryEntry {
  id:          string;
  agentId:     string;
  runId?:      string;
  taskId?:     string;
  tier:        MemoryTier;
  key:         string;
  content:     string;
  metadata?:   Record<string, string>;
  embedding?:  number[];   // float32 vector for semantic tier
  createdAt:   string;     // ISO 8601
  expiresAt?:  string;
}

export interface StoreMemoryRequest {
  agentId:   string;
  runId?:    string;
  taskId?:   string;
  tier:      MemoryTier;
  key:       string;
  content:   string;
  metadata?: Record<string, string>;
  ttlSecs?:  number;       // 0 = no expiry
}

export interface StoreMemoryResponse {
  id:   string;
  tier: MemoryTier;
}

export interface SearchMemoryRequest {
  agentId:   string;
  query:     string;
  tier?:     MemoryTier;  // omit to search all tiers
  topK?:     number;      // default 5
  minScore?: number;      // default 0
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score: number;          // 0–1 cosine similarity or ts_rank
}
