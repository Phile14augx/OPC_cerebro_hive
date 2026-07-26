// Package temporal provides Temporal workflow and activity definitions for
// the HiveSwarm runtime. Using Temporal gives us durable execution, automatic
// retry, timers, human-approval signals, and workflow versioning for free.
//
// Workflow hierarchy:
//
//	DAGRunWorkflow
//	└── per wave: concurrent ExecuteTaskActivity calls
//	    ├── (optional) GovernanceCheckActivity
//	    └── ExecuteTaskActivity → agent dispatch
package temporal

import (
	"encoding/json"
	"time"

	"go.temporal.io/sdk/temporal"
	"go.temporal.io/sdk/workflow"
)

// ── Signal names ──────────────────────────────────────────────────────────────

const (
	HumanApprovalSignal = "human.approval"
	CancelRunSignal     = "run.cancel"
	PauseRunSignal      = "run.pause"
	ResumeRunSignal     = "run.resume"
)

// ── Workflow input / output ───────────────────────────────────────────────────

// DAGRunInput is the payload passed to DAGRunWorkflow on start.
type DAGRunInput struct {
	RunID     string         `json:"runId"`
	DAGID     string         `json:"dagId"`
	TenantID  string         `json:"tenantId"`
	UserID    string         `json:"userId"`
	Input     map[string]any `json:"input"`
	WavesJSON string         `json:"wavesJson"` // JSON-encoded []TaskWave
}

// TaskWave is a group of task IDs that can be dispatched concurrently.
type TaskWave struct {
	WaveIndex   int      `json:"waveIndex"`
	TaskIDs     []string `json:"taskIds"`
	HasParallel bool     `json:"hasParallel"`
}

// DAGRunOutput is the result of a completed DAGRunWorkflow.
type DAGRunOutput struct {
	RunID        string         `json:"runId"`
	Success      bool           `json:"success"`
	Output       map[string]any `json:"output"`
	ErrorMsg     string         `json:"errorMsg,omitempty"`
	DurationMs   int64          `json:"durationMs"`
	TotalTokens  int            `json:"totalTokens"`
	TotalCostUsd float64        `json:"totalCostUsd"`
}

// TaskActivityInput is passed to ExecuteTaskActivity.
type TaskActivityInput struct {
	TaskID     string `json:"taskId"`
	RunID      string `json:"runId"`
	TenantID   string `json:"tenantId"`
	Capability string `json:"capability"`
	Priority   string `json:"priority"`
}

// TaskActivityOutput is the result of ExecuteTaskActivity.
type TaskActivityOutput struct {
	TaskID     string         `json:"taskId"`
	Success    bool           `json:"success"`
	Output     map[string]any `json:"output"`
	ErrorMsg   string         `json:"errorMsg,omitempty"`
	TokensUsed int            `json:"tokensUsed"`
	CostUsd    float64        `json:"costUsd"`
	DurationMs int64          `json:"durationMs"`
}

// ── Workflow ──────────────────────────────────────────────────────────────────

// DAGRunWorkflow orchestrates the execution of a compiled TaskDAG.
// Each wave is executed sequentially; tasks within a wave run concurrently.
// Human-approval gates block the workflow until a signal arrives.
func DAGRunWorkflow(ctx workflow.Context, input DAGRunInput) (*DAGRunOutput, error) {
	logger := workflow.GetLogger(ctx)
	logger.Info("DAGRunWorkflow started", "runId", input.RunID, "dagId", input.DAGID)

	startTime := workflow.Now(ctx)
	output := &DAGRunOutput{RunID: input.RunID}

	// Parse waves from JSON
	var waves []TaskWave
	if input.WavesJSON != "" {
		if err := json.Unmarshal([]byte(input.WavesJSON), &waves); err != nil {
			output.ErrorMsg = "failed to parse DAG waves: " + err.Error()
			return output, nil
		}
	}

	// Signal channels
	cancelCh := workflow.GetSignalChannel(ctx, CancelRunSignal)
	pauseCh := workflow.GetSignalChannel(ctx, PauseRunSignal)
	resumeCh := workflow.GetSignalChannel(ctx, ResumeRunSignal)

	paused := false

	for _, wave := range waves {
		// Poll for cancellation (non-blocking)
		var cancelMsg string
		if cancelCh.ReceiveAsync(&cancelMsg) {
			output.ErrorMsg = "run cancelled"
			return output, nil
		}

		// Poll for pause
		var pauseMsg string
		if pauseCh.ReceiveAsync(&pauseMsg) {
			paused = true
			logger.Info("DAGRunWorkflow paused", "runId", input.RunID)
		}

		// Block until resumed
		if paused {
			var resumeMsg string
			resumeCh.Receive(ctx, &resumeMsg)
			paused = false
			logger.Info("DAGRunWorkflow resumed", "runId", input.RunID)
		}

		logger.Info("dispatching wave", "waveIndex", wave.WaveIndex, "tasks", len(wave.TaskIDs))

		// Launch all tasks in the wave as concurrent Temporal goroutines
		futures := make([]workflow.Future, 0, len(wave.TaskIDs))
		for _, taskID := range wave.TaskIDs {
			taskInput := TaskActivityInput{
				TaskID:   taskID,
				RunID:    input.RunID,
				TenantID: input.TenantID,
			}
			ao := workflow.ActivityOptions{
				StartToCloseTimeout: 15 * time.Minute,
				HeartbeatTimeout:    30 * time.Second,
				RetryPolicy: &temporal.RetryPolicy{
					MaximumAttempts:        3,
					InitialInterval:        2 * time.Second,
					BackoffCoefficient:     2.0,
					MaximumInterval:        30 * time.Second,
					NonRetryableErrorTypes: []string{"[GovernanceVeto]", "[AgentNotFound]"},
				},
			}
			actCtx := workflow.WithActivityOptions(ctx, ao)
			future := workflow.ExecuteActivity(actCtx, ExecuteTaskActivity, taskInput)
			futures = append(futures, future)
		}

		// Wait for all tasks in the wave
		for i, future := range futures {
			var taskOutput TaskActivityOutput
			if err := future.Get(ctx, &taskOutput); err != nil {
				logger.Error("task failed", "waveIndex", wave.WaveIndex, "taskIdx", i, "error", err)
				output.ErrorMsg = err.Error()
				output.DurationMs = workflow.Now(ctx).Sub(startTime).Milliseconds()
				return output, nil
			}
			output.TotalTokens += taskOutput.TokensUsed
			output.TotalCostUsd += taskOutput.CostUsd
		}
	}

	output.Success = true
	output.DurationMs = workflow.Now(ctx).Sub(startTime).Milliseconds()
	logger.Info("DAGRunWorkflow completed", "runId", input.RunID, "durationMs", output.DurationMs)
	return output, nil
}

// ExecuteTaskActivity is declared here so the workflow can reference it by
// function value. The actual implementation is in activities.go on the
// Activities struct — registered via worker.RegisterActivity.
var ExecuteTaskActivity func(ctx interface{}, input TaskActivityInput) (*TaskActivityOutput, error)
