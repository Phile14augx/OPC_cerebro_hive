// Package store defines the core memory types for the HiveSwarm memory service.
//
// Four memory tiers:
//
//	Working   — short-lived agent scratchpad (Redis, TTL-keyed)
//	Semantic  — vector-indexed facts for similarity search (Redis Stack / pgvector)
//	LongTerm  — persisted knowledge across sessions (PostgreSQL)
//	Execution — checkpoints keyed by run+task (Redis)
package store

import "time"

// MemoryTier identifies which storage backend a memory entry uses.
type MemoryTier string

const (
	TierWorking   MemoryTier = "working"
	TierSemantic  MemoryTier = "semantic"
	TierLongTerm  MemoryTier = "long_term"
	TierExecution MemoryTier = "execution"
)

// MemoryEntry is the canonical memory record across all tiers.
type MemoryEntry struct {
	ID         string            `json:"id"`
	AgentID    string            `json:"agentId"`
	RunID      string            `json:"runId,omitempty"`
	TaskID     string            `json:"taskId,omitempty"`
	Tier       MemoryTier        `json:"tier"`
	Key        string            `json:"key"`
	Content    string            `json:"content"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Embedding  []float32         `json:"embedding,omitempty"` // set for semantic tier
	CreatedAt  time.Time         `json:"createdAt"`
	ExpiresAt  *time.Time        `json:"expiresAt,omitempty"`
}

// StoreRequest is the body for POST /memory/store.
type StoreRequest struct {
	AgentID   string            `json:"agentId"   binding:"required"`
	RunID     string            `json:"runId"`
	TaskID    string            `json:"taskId"`
	Tier      MemoryTier        `json:"tier"      binding:"required"`
	Key       string            `json:"key"       binding:"required"`
	Content   string            `json:"content"   binding:"required"`
	Metadata  map[string]string `json:"metadata"`
	TTLSecs   int               `json:"ttlSecs"`  // 0 = no expiry (working tier default: 3600)
}

// SearchRequest is the body for POST /memory/search.
type SearchRequest struct {
	AgentID    string     `json:"agentId"   binding:"required"`
	Query      string     `json:"query"     binding:"required"`
	Tier       MemoryTier `json:"tier"`      // empty = all tiers
	TopK       int        `json:"topK"`      // default 5
	MinScore   float32    `json:"minScore"`  // default 0.0 (semantic cosine sim)
}

// SearchResult is a single ranked memory hit.
type SearchResult struct {
	Entry MemoryEntry `json:"entry"`
	Score float32     `json:"score"` // 1.0 = exact, 0.0 = unrelated
}
