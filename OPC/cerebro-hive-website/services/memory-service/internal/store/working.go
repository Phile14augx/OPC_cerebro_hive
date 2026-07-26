// Package store — Working memory tier (Redis with TTL).
package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	defaultWorkingTTL = 3600 * time.Second // 1 hour
	workingKeyPrefix  = "swarm:mem:working:"
)

// WorkingStore manages short-lived agent scratchpad entries in Redis.
type WorkingStore struct {
	rdb *redis.Client
}

// NewWorkingStore creates a WorkingStore.
func NewWorkingStore(rdb *redis.Client) *WorkingStore {
	return &WorkingStore{rdb: rdb}
}

// Set stores a memory entry with an optional TTL.
func (s *WorkingStore) Set(ctx context.Context, entry MemoryEntry) error {
	data, err := json.Marshal(entry)
	if err != nil {
		return fmt.Errorf("marshal working entry: %w", err)
	}
	ttl := defaultWorkingTTL
	if entry.ExpiresAt != nil {
		d := time.Until(*entry.ExpiresAt)
		if d > 0 {
			ttl = d
		}
	}
	key := workingKeyPrefix + entry.AgentID + ":" + entry.Key
	return s.rdb.Set(ctx, key, data, ttl).Err()
}

// Get retrieves a single working memory entry.
func (s *WorkingStore) Get(ctx context.Context, agentID, key string) (*MemoryEntry, error) {
	raw, err := s.rdb.Get(ctx, workingKeyPrefix+agentID+":"+key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis get working: %w", err)
	}
	var entry MemoryEntry
	if err := json.Unmarshal([]byte(raw), &entry); err != nil {
		return nil, fmt.Errorf("unmarshal working entry: %w", err)
	}
	return &entry, nil
}

// ListByAgent returns all working memory keys for a given agent (scan-based).
func (s *WorkingStore) ListByAgent(ctx context.Context, agentID string) ([]MemoryEntry, error) {
	pattern := workingKeyPrefix + agentID + ":*"
	var cursor uint64
	var entries []MemoryEntry
	for {
		keys, next, err := s.rdb.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return nil, fmt.Errorf("scan working keys: %w", err)
		}
		for _, k := range keys {
			raw, err := s.rdb.Get(ctx, k).Result()
			if err != nil {
				continue // key may have expired between scan and get
			}
			var e MemoryEntry
			if err := json.Unmarshal([]byte(raw), &e); err == nil {
				entries = append(entries, e)
			}
		}
		cursor = next
		if cursor == 0 {
			break
		}
	}
	return entries, nil
}

// Delete removes a single working memory entry.
func (s *WorkingStore) Delete(ctx context.Context, agentID, key string) error {
	return s.rdb.Del(ctx, workingKeyPrefix+agentID+":"+key).Err()
}

// DeleteAll removes all working memory for an agent.
func (s *WorkingStore) DeleteAll(ctx context.Context, agentID string) error {
	pattern := workingKeyPrefix + agentID + ":*"
	var cursor uint64
	for {
		keys, next, err := s.rdb.Scan(ctx, cursor, pattern, 100).Result()
		if err != nil {
			return fmt.Errorf("scan for delete: %w", err)
		}
		if len(keys) > 0 {
			if err := s.rdb.Del(ctx, keys...).Err(); err != nil {
				return err
			}
		}
		cursor = next
		if cursor == 0 {
			break
		}
	}
	return nil
}
