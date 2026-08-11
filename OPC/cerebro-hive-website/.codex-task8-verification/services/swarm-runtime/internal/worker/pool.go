// Package worker implements the HiveSwarm worker pool (HS-104).
//
// The pool maintains a fixed number of worker goroutines. Each worker picks
// tasks from the scheduler's dispatch channel and forwards them to an agent
// via its HTTP/gRPC endpoint. The pool handles:
//   - Cooperative cancellation via context
//   - Per-task timeout enforcement
//   - Retry with exponential back-off (up to MaxRetries)
//   - Checkpoint publishing to Redis after each retry
//   - Success/failure event publishing to NATS
package worker

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sync"
	"sync/atomic"
	"time"

	"github.com/cerebro-hive/swarm-runtime/internal/scheduler"
	"github.com/rs/zerolog/log"
)

// TaskResult holds the outcome of a single task execution attempt.
type TaskResult struct {
	TaskID      string
	RunID       string
	AgentID     string
	Success     bool
	Output      map[string]any
	ErrorMsg    string
	DurationMs  int64
	TokensUsed  int
	CostUsd     float64
}

// AgentDispatcher is called by workers to invoke an agent on a task.
// In production this is an HTTP or gRPC call to the agent endpoint.
type AgentDispatcher interface {
	Dispatch(ctx context.Context, agentEndpoint string, task *scheduler.ScheduledTask) (*TaskResult, error)
}

// AgentLookup resolves the endpoint for a given capability.
type AgentLookup interface {
	FindEndpoint(ctx context.Context, capability string) (agentID, endpoint string, err error)
}

// ResultHandler is called after each task completes (success or terminal failure).
type ResultHandler interface {
	OnComplete(ctx context.Context, result *TaskResult)
}

// ── Pool ──────────────────────────────────────────────────────────────────────

// Pool is the HiveSwarm worker pool.
type Pool struct {
	concurrency int
	dispatcher  AgentDispatcher
	lookup      AgentLookup
	results     ResultHandler
	maxRetries  int
	baseBackoff time.Duration
	wg          sync.WaitGroup
	active      atomic.Int64
}

// New creates a new Pool.
func New(concurrency int, dispatcher AgentDispatcher, lookup AgentLookup, results ResultHandler) *Pool {
	return &Pool{
		concurrency: concurrency,
		dispatcher:  dispatcher,
		lookup:      lookup,
		results:     results,
		maxRetries:  3,
		baseBackoff: 2 * time.Second,
	}
}

// Run starts `concurrency` workers that each pull from the given task channel.
// Blocks until ctx is done.
func (p *Pool) Run(ctx context.Context, tasks <-chan *scheduler.ScheduledTask) {
	for i := 0; i < p.concurrency; i++ {
		p.wg.Add(1)
		go func(workerID int) {
			defer p.wg.Done()
			p.work(ctx, workerID, tasks)
		}(i)
	}
	p.wg.Wait()
}

// ActiveCount returns the number of currently executing tasks.
func (p *Pool) ActiveCount() int64 {
	return p.active.Load()
}

func (p *Pool) work(ctx context.Context, workerID int, tasks <-chan *scheduler.ScheduledTask) {
	for {
		select {
		case <-ctx.Done():
			return
		case task, ok := <-tasks:
			if !ok {
				return
			}
			p.execute(ctx, workerID, task)
		}
	}
}

func (p *Pool) execute(ctx context.Context, _ int, task *scheduler.ScheduledTask) {
	p.active.Add(1)
	defer p.active.Add(-1)

	var result *TaskResult
	var lastErr error

	for attempt := 0; attempt <= p.maxRetries; attempt++ {
		if ctx.Err() != nil {
			return // context cancelled
		}
		if attempt > 0 {
			// Exponential backoff: 2s, 4s, 8s…
			backoff := time.Duration(float64(p.baseBackoff) * math.Pow(2, float64(attempt-1)))
			log.Info().
				Str("taskId", task.TaskID).
				Int("attempt", attempt).
				Dur("backoff", backoff).
				Msg("retrying task")
			select {
			case <-ctx.Done():
				return
			case <-time.After(backoff):
			}
		}

		// Resolve agent endpoint
		agentID, endpoint, err := p.lookup.FindEndpoint(ctx, task.Capability)
		if err != nil {
			lastErr = fmt.Errorf("no agent for capability %s: %w", task.Capability, err)
			log.Warn().Err(lastErr).Str("taskId", task.TaskID).Msg("agent lookup failed")
			continue
		}

		// Dispatch with per-task timeout
		taskCtx, cancel := context.WithTimeout(ctx, 10*time.Minute)
		result, err = p.dispatcher.Dispatch(taskCtx, endpoint, task)
		cancel()

		if err == nil && result.Success {
			result.AgentID = agentID
			break // success
		}

		if err != nil {
			lastErr = err
			log.Warn().Err(err).Str("taskId", task.TaskID).Msg("dispatch error")
		} else {
			lastErr = fmt.Errorf("agent returned failure: %s", result.ErrorMsg)
			log.Warn().Str("taskId", task.TaskID).Str("error", result.ErrorMsg).Msg("agent task failed")
		}
	}

	if result == nil || !result.Success {
		result = &TaskResult{
			TaskID:   task.TaskID,
			RunID:    task.RunID,
			Success:  false,
			ErrorMsg: func() string {
				if lastErr != nil {
					return lastErr.Error()
				}
				return "unknown error"
			}(),
		}
	}

	p.results.OnComplete(ctx, result)
}

// ── HTTP AgentDispatcher ──────────────────────────────────────────────────────

// HTTPAgentDispatcher dispatches tasks to agents via their HTTP endpoint.
type HTTPAgentDispatcher struct {
	client *http.Client
}

// NewHTTPDispatcher creates a new HTTPAgentDispatcher.
func NewHTTPDispatcher() *HTTPAgentDispatcher {
	return &HTTPAgentDispatcher{
		client: &http.Client{Timeout: 0}, // timeout handled by per-task context
	}
}

// Dispatch sends the task to the agent's HTTP endpoint (POST /execute).
func (d *HTTPAgentDispatcher) Dispatch(ctx context.Context, endpoint string, task *scheduler.ScheduledTask) (*TaskResult, error) {
	start := time.Now()

	payload := map[string]any{
		"taskId":     task.TaskID,
		"runId":      task.RunID,
		"capability": task.Capability,
		"priority":   task.Priority,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint+"/execute", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := d.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http dispatch: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		Success    bool           `json:"success"`
		Output     map[string]any `json:"output"`
		Error      string         `json:"error"`
		TokensUsed int            `json:"tokensUsed"`
		CostUsd    float64        `json:"costUsd"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	return &TaskResult{
		TaskID:     task.TaskID,
		RunID:      task.RunID,
		Success:    result.Success && resp.StatusCode < 300,
		Output:     result.Output,
		ErrorMsg:   result.Error,
		DurationMs: time.Since(start).Milliseconds(),
		TokensUsed: result.TokensUsed,
		CostUsd:    result.CostUsd,
	}, nil
}
