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
	taskKeyPrefix = "swarm:task:"
	taskTTL       = 7 * 24 * time.Hour
)

// RedisTaskStore implements TaskStore using Redis.
type RedisTaskStore struct {
	rdb *redis.Client
}

// NewRedisTaskStore creates a new RedisTaskStore.
func NewRedisTaskStore(rdb *redis.Client) *RedisTaskStore {
	return &RedisTaskStore{rdb: rdb}
}

func (s *RedisTaskStore) Create(ctx context.Context, task *domain.Task) error {
	data, err := json.Marshal(task)
	if err != nil {
		return fmt.Errorf("marshal task: %w", err)
	}
	pipe := s.rdb.Pipeline()
	pipe.Set(ctx, taskKeyPrefix+task.ID, data, taskTTL)
	// Index by run for ListByRun
	pipe.SAdd(ctx, "swarm:tasks:run:"+task.RunID, task.ID)
	pipe.Expire(ctx, "swarm:tasks:run:"+task.RunID, taskTTL)
	_, err = pipe.Exec(ctx)
	return err
}

func (s *RedisTaskStore) Get(ctx context.Context, id string) (*domain.Task, error) {
	data, err := s.rdb.Get(ctx, taskKeyPrefix+id).Bytes()
	if err == redis.Nil {
		return nil, fmt.Errorf("task %s not found", id)
	}
	if err != nil {
		return nil, err
	}
	var task domain.Task
	return &task, json.Unmarshal(data, &task)
}

func (s *RedisTaskStore) ListByRun(ctx context.Context, runID string) ([]*domain.Task, error) {
	ids, err := s.rdb.SMembers(ctx, "swarm:tasks:run:"+runID).Result()
	if err != nil {
		return nil, err
	}
	tasks := make([]*domain.Task, 0, len(ids))
	for _, id := range ids {
		t, err := s.Get(ctx, id)
		if err != nil {
			continue
		}
		tasks = append(tasks, t)
	}
	return tasks, nil
}

func (s *RedisTaskStore) UpdateStatus(ctx context.Context, id string, status domain.TaskStatus) error {
	task, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	task.Status = status
	switch status {
	case domain.TaskRunning:
		now := time.Now()
		task.StartedAt = &now
	case domain.TaskCompleted, domain.TaskFailed, domain.TaskCancelled:
		now := time.Now()
		task.CompletedAt = &now
	}
	return s.save(ctx, task)
}

func (s *RedisTaskStore) Complete(ctx context.Context, id string, output map[string]any, tokensUsed int, costUsd float64) error {
	task, err := s.Get(ctx, id)
	if err != nil {
		return err
	}
	task.Status = domain.TaskCompleted
	now := time.Now()
	task.CompletedAt = &now
	// Store output + cost metadata
	if task.Metadata == nil {
		task.Metadata = make(map[string]string)
	}
	task.Metadata["tokensUsed"] = fmt.Sprintf("%d", tokensUsed)
	task.Metadata["costUsd"] = fmt.Sprintf("%.6f", costUsd)

	// Store output separately so it doesn't bloat the task record
	if output != nil {
		outJSON, _ := json.Marshal(output)
		_ = s.rdb.Set(ctx, "swarm:task:output:"+id, outJSON, taskTTL).Err()
	}
	return s.save(ctx, task)
}

func (s *RedisTaskStore) save(ctx context.Context, task *domain.Task) error {
	data, err := json.Marshal(task)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, taskKeyPrefix+task.ID, data, taskTTL).Err()
}
