package store

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/cerebro-hive/swarm-api/internal/domain"
	"github.com/redis/go-redis/v9"
)

const (
	agentKeyPrefix = "swarm:agent:"
	agentSetKey    = "swarm:agents"
	runKeyPrefix   = "swarm:run:"
)

// RedisAgentStore implements AgentStore using Redis hashes + sorted sets.
type RedisAgentStore struct {
	rdb *redis.Client
}

// NewRedisAgentStore creates a new RedisAgentStore.
func NewRedisAgentStore(rdb *redis.Client) *RedisAgentStore {
	return &RedisAgentStore{rdb: rdb}
}

func (s *RedisAgentStore) Register(ctx context.Context, agent *domain.Agent) error {
	data, err := json.Marshal(agent)
	if err != nil {
		return fmt.Errorf("marshal agent: %w", err)
	}
	pipe := s.rdb.Pipeline()
	pipe.Set(ctx, agentKeyPrefix+agent.ID, data, 0)
	pipe.SAdd(ctx, agentSetKey, agent.ID)
	// Index by capability for fast lookup
	for _, cap := range agent.Capabilities {
		pipe.SAdd(ctx, "swarm:agents:cap:"+cap, agent.ID)
	}
	_, err = pipe.Exec(ctx)
	return err
}

func (s *RedisAgentStore) Get(ctx context.Context, id string) (*domain.Agent, error) {
	data, err := s.rdb.Get(ctx, agentKeyPrefix+id).Bytes()
	if err == redis.Nil {
		return nil, fmt.Errorf("agent %s not found", id)
	}
	if err != nil {
		return nil, err
	}
	var agent domain.Agent
	if err := json.Unmarshal(data, &agent); err != nil {
		return nil, err
	}
	return &agent, nil
}

func (s *RedisAgentStore) List(ctx context.Context, filter domain.AgentFilter) ([]*domain.Agent, error) {
	var ids []string
	var err error

	if filter.Capability != "" {
		ids, err = s.rdb.SMembers(ctx, "swarm:agents:cap:"+filter.Capability).Result()
	} else {
		ids, err = s.rdb.SMembers(ctx, agentSetKey).Result()
	}
	if err != nil {
		return nil, err
	}

	agents := make([]*domain.Agent, 0, len(ids))
	for _, id := range ids {
		a, err := s.Get(ctx, id)
		if err != nil {
			continue
		}
		if filter.Status != "" && a.Status != filter.Status {
			continue
		}
		agents = append(agents, a)
	}

	// Apply limit / offset
	limit := filter.Limit
	if limit <= 0 {
		limit = 100
	}
	offset := filter.Offset
	if offset >= len(agents) {
		return []*domain.Agent{}, nil
	}
	end := offset + limit
	if end > len(agents) {
		end = len(agents)
	}
	return agents[offset:end], nil
}

func (s *RedisAgentStore) UpdateStatus(ctx context.Context, id string, status domain.AgentStatus) error {
	a, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	a.Status = status
	a.UpdatedAt = time.Now()
	return s.save(ctx, a)
}

func (s *RedisAgentStore) UpdateHealth(ctx context.Context, id string, health domain.AgentHealth, activeRuns int) error {
	a, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	a.Health = health
	a.ActiveRuns = activeRuns
	if a.Concurrency > 0 {
		a.LoadFactor = float64(activeRuns) / float64(a.Concurrency)
	}
	a.LastSeenAt = time.Now()
	a.UpdatedAt = time.Now()
	return s.save(ctx, a)
}

func (s *RedisAgentStore) Deregister(ctx context.Context, id string) error {
	a, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	pipe := s.rdb.Pipeline()
	pipe.Del(ctx, agentKeyPrefix+id)
	pipe.SRem(ctx, agentSetKey, id)
	for _, cap := range a.Capabilities {
		pipe.SRem(ctx, "swarm:agents:cap:"+cap, id)
	}
	_, err = pipe.Exec(ctx)
	return err
}

func (s *RedisAgentStore) FindByCapability(ctx context.Context, capability string) ([]*domain.Agent, error) {
	return s.List(ctx, domain.AgentFilter{
		Capability: capability,
		Status:     domain.AgentStatusActive,
		Limit:      50,
	})
}

func (s *RedisAgentStore) save(ctx context.Context, a *domain.Agent) error {
	data, err := json.Marshal(a)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, agentKeyPrefix+a.ID, data, 0).Err()
}

// ── RedisRunStore ──────────────────────────────────────────────────────────────

// RedisRunStore implements RunStore.
type RedisRunStore struct {
	rdb *redis.Client
}

// NewRedisRunStore creates a new RedisRunStore.
func NewRedisRunStore(rdb *redis.Client) *RedisRunStore {
	return &RedisRunStore{rdb: rdb}
}

func (s *RedisRunStore) CreateRun(ctx context.Context, run *domain.DAGRun) error {
	data, err := json.Marshal(run)
	if err != nil {
		return err
	}
	pipe := s.rdb.Pipeline()
	// TTL of 7 days for run data
	pipe.Set(ctx, runKeyPrefix+run.ID, data, 7*24*time.Hour)
	pipe.SAdd(ctx, "swarm:runs:tenant:"+run.TenantID, run.ID)
	_, err = pipe.Exec(ctx)
	return err
}

func (s *RedisRunStore) GetRun(ctx context.Context, id string) (*domain.DAGRun, error) {
	data, err := s.rdb.Get(ctx, runKeyPrefix+id).Bytes()
	if err == redis.Nil {
		return nil, fmt.Errorf("run %s not found", id)
	}
	if err != nil {
		return nil, err
	}
	var run domain.DAGRun
	return &run, json.Unmarshal(data, &run)
}

func (s *RedisRunStore) UpdateRunStatus(ctx context.Context, id string, status domain.RunStatus) error {
	run, err := s.GetRun(ctx, id)
	if err != nil {
		return err
	}
	run.Status = status
	if status == domain.RunCompleted || status == domain.RunFailed || status == domain.RunCancelled {
		now := time.Now()
		run.CompletedAt = &now
	}
	data, err := json.Marshal(run)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, runKeyPrefix+id, data, 7*24*time.Hour).Err()
}

func (s *RedisRunStore) UpdateTaskStatus(ctx context.Context, runID, taskID string, status domain.TaskStatus) error {
	run, err := s.GetRun(ctx, runID)
	if err != nil {
		return err
	}
	if run.TaskStatuses == nil {
		run.TaskStatuses = make(map[string]string)
	}
	run.TaskStatuses[taskID] = string(status)
	data, err := json.Marshal(run)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, runKeyPrefix+runID, data, 7*24*time.Hour).Err()
}

func (s *RedisRunStore) ListRuns(ctx context.Context, tenantID string, limit, offset int) ([]*domain.DAGRun, error) {
	ids, err := s.rdb.SMembers(ctx, "swarm:runs:tenant:"+tenantID).Result()
	if err != nil {
		return nil, err
	}
	runs := make([]*domain.DAGRun, 0, len(ids))
	for _, id := range ids {
		r, err := s.GetRun(ctx, id)
		if err != nil {
			continue
		}
		runs = append(runs, r)
	}
	if offset >= len(runs) {
		return []*domain.DAGRun{}, nil
	}
	end := offset + limit
	if end > len(runs) {
		end = len(runs)
	}
	return runs[offset:end], nil
}
