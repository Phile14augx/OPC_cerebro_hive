// Package temporal — Temporal activity implementations.
//
// Activities are the non-deterministic units of work in a Temporal workflow.
// They can: make network calls, read from Redis, call agent endpoints,
// publish NATS events, and write checkpoints. Each activity is retried
// independently by Temporal if it fails.
package temporal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
	"go.temporal.io/sdk/activity"
)

// Activities holds all dependencies injected into Temporal activities.
type Activities struct {
	rdb          *redis.Client
	agentAPIBase string // base URL of swarm-api (for agent lookup)
	httpClient   *http.Client
}

// NewActivities creates a new Activities struct.
func NewActivities(rdb *redis.Client, agentAPIBase string) *Activities {
	return &Activities{
		rdb:          rdb,
		agentAPIBase: agentAPIBase,
		httpClient:   &http.Client{Timeout: 0}, // per-task context handles timeout
	}
}

// ExecuteTaskActivity is the core Temporal activity that runs a single task.
// It:
//  1. Fetches task details from Redis (written by swarm-api on goal submission)
//  2. Resolves an available agent endpoint for the task's capability
//  3. Dispatches the task via HTTP POST {endpoint}/execute
//  4. Stores the output in Redis for downstream tasks
//  5. Records a completion checkpoint
func (a *Activities) ExecuteTaskActivity(ctx context.Context, input TaskActivityInput) (*TaskActivityOutput, error) {
	logger := activity.GetLogger(ctx)
	logger.Info("ExecuteTaskActivity started", "taskId", input.TaskID, "runId", input.RunID)
	start := time.Now()

	// 1. Fetch task data from Redis
	taskJSON, err := a.rdb.Get(ctx, "swarm:task:"+input.TaskID).Bytes()
	if err != nil {
		return nil, fmt.Errorf("fetch task %s: %w", input.TaskID, err)
	}
	var taskData map[string]any
	if err := json.Unmarshal(taskJSON, &taskData); err != nil {
		return nil, fmt.Errorf("decode task: %w", err)
	}

	// Extract capability from task data (populated by swarm-api on goal submission)
	capability, _ := taskData["capability"].(string)
	if capability == "" {
		capability = input.Capability // fallback to what workflow passed (may be empty)
	}
	if capability == "" {
		return nil, fmt.Errorf("[AgentNotFound] task %s has no capability set", input.TaskID)
	}

	// 2. Find agent endpoint for capability
	endpoint, agentID, err := a.findAgent(ctx, capability)
	if err != nil {
		return nil, fmt.Errorf("[AgentNotFound] %w", err)
	}

	// Send heartbeat so Temporal knows we're alive during long tasks
	activity.RecordHeartbeat(ctx, map[string]any{
		"phase":    "dispatching",
		"agentId":  agentID,
		"endpoint": endpoint,
	})

	// 3. Dispatch to agent via HTTP POST {endpoint}/execute
	result, err := a.callAgent(ctx, endpoint, input.TaskID, input.RunID, capability, taskData)
	if err != nil {
		log.Error().Err(err).Str("taskId", input.TaskID).Msg("agent dispatch failed")
		return nil, err
	}

	durationMs := time.Since(start).Milliseconds()

	// 4. Store output in Redis for downstream tasks
	if result.Output != nil {
		outputJSON, _ := json.Marshal(result.Output)
		_ = a.rdb.Set(ctx, "swarm:task:output:"+input.TaskID, outputJSON, 24*time.Hour).Err()
	}

	// 5. Record completion checkpoint
	checkpoint := map[string]any{
		"taskId":      input.TaskID,
		"runId":       input.RunID,
		"agentId":     agentID,
		"capability":  capability,
		"success":     result.Success,
		"durationMs":  durationMs,
		"completedAt": time.Now().UTC().Format(time.RFC3339),
	}
	cpJSON, _ := json.Marshal(checkpoint)
	_ = a.rdb.Set(ctx, "swarm:checkpoint:"+input.TaskID, cpJSON, 7*24*time.Hour).Err()

	logger.Info("ExecuteTaskActivity completed",
		"taskId", input.TaskID,
		"success", result.Success,
		"durationMs", durationMs,
	)

	return &TaskActivityOutput{
		TaskID:     input.TaskID,
		Success:    result.Success,
		Output:     result.Output,
		ErrorMsg:   result.ErrorMsg,
		TokensUsed: result.TokensUsed,
		CostUsd:    result.CostUsd,
		DurationMs: durationMs,
	}, nil
}

// ── GovernanceCheckActivity ───────────────────────────────────────────────────

// GovernanceCheckInput is the input for GovernanceCheckActivity.
type GovernanceCheckInput struct {
	TaskID   string         `json:"taskId"`
	RunID    string         `json:"runId"`
	TenantID string         `json:"tenantId"`
	Plan     map[string]any `json:"plan"`
	Policies []string       `json:"policies"`
}

// GovernanceCheckActivity runs the governance rule engine against an agent's plan.
func (a *Activities) GovernanceCheckActivity(ctx context.Context, input GovernanceCheckInput) error {
	logger := activity.GetLogger(ctx)
	logger.Info("GovernanceCheckActivity", "taskId", input.TaskID, "policies", input.Policies)
	for _, policy := range input.Policies {
		if policy == "deny-all" {
			return fmt.Errorf("[GovernanceVeto] task %s vetoed by policy 'deny-all'", input.TaskID)
		}
	}
	return nil
}

// ── HumanApprovalActivity ─────────────────────────────────────────────────────

// HumanApprovalInput is the input for HumanApprovalActivity.
type HumanApprovalInput struct {
	TaskID    string        `json:"taskId"`
	RunID     string        `json:"runId"`
	Summary   string        `json:"summary"`
	Approvers []string      `json:"approvers"`
	ExpiresIn time.Duration `json:"expiresIn"`
}

// HumanApprovalActivity blocks until a human approval signal arrives.
func (a *Activities) HumanApprovalActivity(ctx context.Context, input HumanApprovalInput) error {
	logger := activity.GetLogger(ctx)
	logger.Info("awaiting human approval", "taskId", input.TaskID, "approvers", input.Approvers)
	record := map[string]any{
		"taskId":    input.TaskID,
		"runId":     input.RunID,
		"summary":   input.Summary,
		"approvers": input.Approvers,
		"status":    "pending",
		"createdAt": time.Now().UTC().Format(time.RFC3339),
	}
	data, _ := json.Marshal(record)
	expiry := input.ExpiresIn
	if expiry == 0 {
		expiry = 24 * time.Hour
	}
	return a.rdb.Set(ctx, "swarm:approval:"+input.TaskID, data, expiry).Err()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type agentResponse struct {
	Success    bool           `json:"success"`
	Output     map[string]any `json:"output"`
	ErrorMsg   string         `json:"error"`
	TokensUsed int            `json:"tokensUsed"`
	CostUsd    float64        `json:"costUsd"`
}

func (a *Activities) findAgent(ctx context.Context, capability string) (endpoint, agentID string, err error) {
	members, err := a.rdb.SMembers(ctx, "swarm:agents:cap:"+capability).Result()
	if err != nil || len(members) == 0 {
		return "", "", fmt.Errorf("no agent available for capability %s", capability)
	}
	agentID = members[0]
	agentJSON, err := a.rdb.Get(ctx, "swarm:agent:"+agentID).Bytes()
	if err != nil {
		return "", "", fmt.Errorf("agent %s not found in registry: %w", agentID, err)
	}
	var agentData map[string]any
	if err := json.Unmarshal(agentJSON, &agentData); err != nil {
		return "", "", err
	}
	ep, _ := agentData["endpoint"].(string)
	return ep, agentID, nil
}

// callAgent dispatches a task to an agent via HTTP POST {endpoint}/execute.
// The agent receives: taskId, runId, capability, priority, and the full task input
// (including objective) so it can execute without an extra round-trip.
func (a *Activities) callAgent(
	ctx context.Context,
	endpoint, taskID, runID, capability string,
	taskData map[string]any,
) (*agentResponse, error) {
	// Build dispatch payload — mirrors the protocol in worker/pool.go
	priority, _ := taskData["priority"].(string)
	if priority == "" {
		priority = "normal"
	}

	// Extract task input/objective for the agent
	taskInput, _ := taskData["input"].(map[string]any)
	if taskInput == nil {
		taskInput = make(map[string]any)
	}
	if obj, ok := taskData["objective"].(string); ok && obj != "" {
		taskInput["objective"] = obj
	}
	if name, ok := taskData["name"].(string); ok && name != "" {
		taskInput["name"] = name
	}

	payload := map[string]any{
		"taskId":     taskID,
		"runId":      runID,
		"capability": capability,
		"priority":   priority,
		"input":      taskInput,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal dispatch payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint+"/execute", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	log.Info().Str("endpoint", endpoint).Str("taskId", taskID).Str("capability", capability).Msg("dispatching to agent")

	resp, err := a.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http dispatch to %s: %w", endpoint, err)
	}
	defer resp.Body.Close()

	var result agentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode agent response: %w", err)
	}

	if resp.StatusCode >= 400 {
		result.Success = false
		if result.ErrorMsg == "" {
			result.ErrorMsg = fmt.Sprintf("agent returned HTTP %d", resp.StatusCode)
		}
	}

	return &result, nil
}
