// Package registry reads the HiveSwarm agent registry from Redis.
// It consumes the same key schema written by swarm-api:
//
//	swarm:agent:<id>          → JSON blob (AgentRecord)
//	swarm:agents:cap:<cap>    → SMEMBERS set of agent IDs
package registry

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// CapabilityEntry describes a single capability of an agent.
type CapabilityEntry struct {
	Capability   string  `json:"capability"`
	Proficiency  float64 `json:"proficiency"` // 0–1
}

// AgentRecord is the full agent descriptor stored in Redis by swarm-api.
type AgentRecord struct {
	ID               string            `json:"id"`
	Name             string            `json:"name"`
	Endpoint         string            `json:"endpoint"`
	Capabilities     []CapabilityEntry `json:"capabilities"`
	Status           string            `json:"status"` // "idle" | "busy" | "terminated"
	CurrentLoad      float64           `json:"currentLoad"`   // 0–1 (fraction of capacity used)
	AvgLatencyMs     float64           `json:"avgLatencyMs"`
	AvgCostPerTask   float64           `json:"avgCostPerTask"`  // USD
	RegisteredAt     string            `json:"registeredAt"`
	LastHeartbeatAt  string            `json:"lastHeartbeatAt"`
}

// Reader queries the Redis agent registry.
type Reader struct {
	rdb *redis.Client
	ttl time.Duration // heartbeat staleness threshold
}

// New creates a Reader connected to the given Redis instance.
func New(rdb *redis.Client) *Reader {
	return &Reader{rdb: rdb, ttl: 30 * time.Second}
}

// GetAgentsForCapability returns all active agents that advertise the given
// capability. Agents whose heartbeat is stale or whose status is "terminated"
// are excluded.
func (r *Reader) GetAgentsForCapability(ctx context.Context, capability string) ([]AgentRecord, error) {
	key := "swarm:agents:cap:" + capability
	ids, err := r.rdb.SMembers(ctx, key).Result()
	if err != nil {
		return nil, fmt.Errorf("smembers %s: %w", key, err)
	}

	agents := make([]AgentRecord, 0, len(ids))
	for _, id := range ids {
		rec, err := r.GetAgent(ctx, id)
		if err != nil || rec == nil {
			continue
		}
		agents = append(agents, *rec)
	}
	return agents, nil
}

// GetAgent fetches a single agent record by ID, returning nil if it is missing
// or considered unhealthy (terminated / stale heartbeat).
func (r *Reader) GetAgent(ctx context.Context, id string) (*AgentRecord, error) {
	raw, err := r.rdb.Get(ctx, "swarm:agent:"+id).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("redis get swarm:agent:%s: %w", id, err)
	}

	var rec AgentRecord
	if err := json.Unmarshal([]byte(raw), &rec); err != nil {
		return nil, fmt.Errorf("unmarshal agent %s: %w", id, err)
	}

	if rec.Status == "terminated" {
		return nil, nil
	}

	// Stale heartbeat check
	if rec.LastHeartbeatAt != "" {
		hb, err := time.Parse(time.RFC3339Nano, rec.LastHeartbeatAt)
		if err == nil && time.Since(hb) > r.ttl {
			return nil, nil
		}
	}

	return &rec, nil
}
