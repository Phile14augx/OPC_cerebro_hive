// Package store defines storage interfaces for the swarm-api service.
package store

import (
	"context"

	"github.com/cerebro-hive/swarm-api/internal/domain"
)

// AgentStore manages agent registry persistence.
type AgentStore interface {
	Register(ctx context.Context, agent *domain.Agent) error
	Get(ctx context.Context, id string) (*domain.Agent, error)
	List(ctx context.Context, filter domain.AgentFilter) ([]*domain.Agent, error)
	UpdateStatus(ctx context.Context, id string, status domain.AgentStatus) error
	UpdateHealth(ctx context.Context, id string, health domain.AgentHealth, activeRuns int) error
	Deregister(ctx context.Context, id string) error
	// FindByCapability returns agents that can serve the given capability, sorted by load.
	FindByCapability(ctx context.Context, capability string) ([]*domain.Agent, error)
}

// RunStore manages DAG run persistence.
type RunStore interface {
	CreateRun(ctx context.Context, run *domain.DAGRun) error
	GetRun(ctx context.Context, id string) (*domain.DAGRun, error)
	UpdateRunStatus(ctx context.Context, id string, status domain.RunStatus) error
	UpdateTaskStatus(ctx context.Context, runID, taskID string, status domain.TaskStatus) error
	ListRuns(ctx context.Context, tenantID string, limit, offset int) ([]*domain.DAGRun, error)
}

// TaskStore manages individual task persistence.
type TaskStore interface {
	Create(ctx context.Context, task *domain.Task) error
	Get(ctx context.Context, id string) (*domain.Task, error)
	ListByRun(ctx context.Context, runID string) ([]*domain.Task, error)
	UpdateStatus(ctx context.Context, id string, status domain.TaskStatus) error
	Complete(ctx context.Context, id string, output map[string]any, tokensUsed int, costUsd float64) error
}
