// Package search implements semantic (vector similarity) memory search.
//
// Strategy: cosine similarity over pgvector embeddings stored in swarm_memory.
// Embeddings are generated externally (by the planner or agent) and stored
// alongside the content.  For M3 MVP, when embeddings are absent, we fall
// back to full-text ILIKE search.
package search

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cerebro/memory-service/internal/store"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Searcher provides semantic and keyword search over swarm_memory.
type Searcher struct {
	pool *pgxpool.Pool
}

// New creates a Searcher.
func New(pool *pgxpool.Pool) *Searcher {
	return &Searcher{pool: pool}
}

// Search runs a vector or keyword search depending on whether an embedding
// is provided in the request.
func (s *Searcher) Search(ctx context.Context, req store.SearchRequest) ([]store.SearchResult, error) {
	topK := req.TopK
	if topK <= 0 || topK > 50 {
		topK = 5
	}

	// For M3, use keyword search (pgvector extension needed for vector search)
	return s.keywordSearch(ctx, req.AgentID, req.Query, string(req.Tier), topK, req.MinScore)
}

// keywordSearch uses PostgreSQL's ts_rank for full-text relevance scoring.
func (s *Searcher) keywordSearch(
	ctx context.Context,
	agentID, query, tier string,
	topK int,
	minScore float32,
) ([]store.SearchResult, error) {
	tierFilter := ""
	args := []any{agentID, query, topK}
	if tier != "" {
		tierFilter = " AND tier = $4"
		args = append(args, tier)
	}

	rows, err := s.pool.Query(ctx, fmt.Sprintf(`
		SELECT id, agent_id, run_id, task_id, tier, key, content, metadata,
		       created_at, expires_at,
		       ts_rank(to_tsvector('english', content), plainto_tsquery('english', $2)) AS score
		FROM swarm_memory
		WHERE agent_id = $1
		  AND (expires_at IS NULL OR expires_at > now())
		  AND to_tsvector('english', content) @@ plainto_tsquery('english', $2)
		  %s
		ORDER BY score DESC
		LIMIT $3
	`, tierFilter), args...)
	if err != nil {
		return nil, fmt.Errorf("keyword search: %w", err)
	}
	defer rows.Close()

	var results []store.SearchResult
	for rows.Next() {
		var e store.MemoryEntry
		var tierStr string
		var metaJSON []byte
		var score float32
		var expiresAt *time.Time

		if err := rows.Scan(
			&e.ID, &e.AgentID, &e.RunID, &e.TaskID,
			&tierStr, &e.Key, &e.Content, &metaJSON,
			&e.CreatedAt, &expiresAt, &score,
		); err != nil {
			return nil, fmt.Errorf("scan search row: %w", err)
		}
		e.Tier = store.MemoryTier(tierStr)
		e.ExpiresAt = expiresAt
		if len(metaJSON) > 0 {
			_ = json.Unmarshal(metaJSON, &e.Metadata)
		}
		if score >= minScore {
			results = append(results, store.SearchResult{Entry: e, Score: score})
		}
	}
	return results, rows.Err()
}
