// Package store — Long-term memory tier (PostgreSQL).
//
// Schema (created by migrations, not this service):
//
//	CREATE TABLE swarm_memory (
//	    id          TEXT PRIMARY KEY,
//	    agent_id    TEXT NOT NULL,
//	    run_id      TEXT,
//	    task_id     TEXT,
//	    tier        TEXT NOT NULL,
//	    key         TEXT NOT NULL,
//	    content     TEXT NOT NULL,
//	    metadata    JSONB,
//	    embedding   vector(1536),       -- pgvector; NULL when tier != semantic
//	    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
//	    expires_at  TIMESTAMPTZ
//	);
//	CREATE INDEX idx_swarm_memory_agent ON swarm_memory(agent_id);
//	CREATE INDEX idx_swarm_memory_agent_key ON swarm_memory(agent_id, key);
package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// LongTermStore persists memory entries in PostgreSQL.
type LongTermStore struct {
	pool *pgxpool.Pool
}

// NewLongTermStore creates a LongTermStore.
func NewLongTermStore(pool *pgxpool.Pool) *LongTermStore {
	return &LongTermStore{pool: pool}
}

// Upsert inserts or replaces a long-term memory entry (unique on agent_id + key).
func (s *LongTermStore) Upsert(ctx context.Context, entry MemoryEntry) (string, error) {
	if entry.ID == "" {
		entry.ID = uuid.New().String()
	}
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now().UTC()
	}

	meta, _ := json.Marshal(entry.Metadata)

	_, err := s.pool.Exec(ctx, `
		INSERT INTO swarm_memory (id, agent_id, run_id, task_id, tier, key, content, metadata, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (agent_id, key) DO UPDATE
		  SET content    = EXCLUDED.content,
		      metadata   = EXCLUDED.metadata,
		      expires_at = EXCLUDED.expires_at
	`, entry.ID, entry.AgentID, entry.RunID, entry.TaskID,
		string(entry.Tier), entry.Key, entry.Content,
		meta, entry.CreatedAt, entry.ExpiresAt,
	)
	if err != nil {
		return "", fmt.Errorf("upsert long-term memory: %w", err)
	}
	return entry.ID, nil
}

// GetByKey retrieves a specific long-term memory entry.
func (s *LongTermStore) GetByKey(ctx context.Context, agentID, key string) (*MemoryEntry, error) {
	row := s.pool.QueryRow(ctx, `
		SELECT id, agent_id, run_id, task_id, tier, key, content, metadata, created_at, expires_at
		FROM swarm_memory WHERE agent_id = $1 AND key = $2
		AND (expires_at IS NULL OR expires_at > now())
	`, agentID, key)

	return scanEntry(row)
}

// ListByAgent retrieves all long-term memory for an agent.
func (s *LongTermStore) ListByAgent(ctx context.Context, agentID string) ([]MemoryEntry, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT id, agent_id, run_id, task_id, tier, key, content, metadata, created_at, expires_at
		FROM swarm_memory WHERE agent_id = $1
		AND (expires_at IS NULL OR expires_at > now())
		ORDER BY created_at DESC LIMIT 200
	`, agentID)
	if err != nil {
		return nil, fmt.Errorf("list long-term memory: %w", err)
	}
	defer rows.Close()
	return collectEntries(rows)
}

// Delete removes a long-term memory entry.
func (s *LongTermStore) Delete(ctx context.Context, agentID, key string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM swarm_memory WHERE agent_id = $1 AND key = $2`, agentID, key)
	return err
}

// DeleteAll removes all long-term memory for an agent.
func (s *LongTermStore) DeleteAll(ctx context.Context, agentID string) error {
	_, err := s.pool.Exec(ctx, `DELETE FROM swarm_memory WHERE agent_id = $1`, agentID)
	return err
}

// ── helpers ────────────────────────────────────────────────────────────────────

func scanEntry(row pgx.Row) (*MemoryEntry, error) {
	var e MemoryEntry
	var tier string
	var metaJSON []byte
	err := row.Scan(
		&e.ID, &e.AgentID, &e.RunID, &e.TaskID,
		&tier, &e.Key, &e.Content, &metaJSON,
		&e.CreatedAt, &e.ExpiresAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("scan memory entry: %w", err)
	}
	e.Tier = MemoryTier(tier)
	if len(metaJSON) > 0 {
		_ = json.Unmarshal(metaJSON, &e.Metadata)
	}
	return &e, nil
}

func collectEntries(rows pgx.Rows) ([]MemoryEntry, error) {
	var entries []MemoryEntry
	for rows.Next() {
		var e MemoryEntry
		var tier string
		var metaJSON []byte
		if err := rows.Scan(
			&e.ID, &e.AgentID, &e.RunID, &e.TaskID,
			&tier, &e.Key, &e.Content, &metaJSON,
			&e.CreatedAt, &e.ExpiresAt,
		); err != nil {
			return nil, fmt.Errorf("scan row: %w", err)
		}
		e.Tier = MemoryTier(tier)
		if len(metaJSON) > 0 {
			_ = json.Unmarshal(metaJSON, &e.Metadata)
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}
