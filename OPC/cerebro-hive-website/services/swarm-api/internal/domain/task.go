package domain

import "time"

// TaskStatus mirrors the TypeScript TaskStatus from swarm-sdk.
type TaskStatus string

const (
	TaskPending          TaskStatus = "pending"
	TaskQueued           TaskStatus = "queued"
	TaskAssigned         TaskStatus = "assigned"
	TaskRunning          TaskStatus = "running"
	TaskPaused           TaskStatus = "paused"
	TaskAwaitingApproval TaskStatus = "awaiting_approval"
	TaskCompleted        TaskStatus = "completed"
	TaskFailed           TaskStatus = "failed"
	TaskCancelled        TaskStatus = "cancelled"
	TaskSkipped          TaskStatus = "skipped"
)

// RunStatus mirrors the TypeScript RunStatus.
type RunStatus string

const (
	RunPending          RunStatus = "pending"
	RunRunning          RunStatus = "running"
	RunPaused           RunStatus = "paused"
	RunAwaitingApproval RunStatus = "awaiting_approval"
	RunCompleted        RunStatus = "completed"
	RunFailed           RunStatus = "failed"
	RunCancelled        RunStatus = "cancelled"
)

// TaskPriority determines scheduler ordering.
type TaskPriority string

const (
	PriorityCritical   TaskPriority = "critical"
	PriorityHigh       TaskPriority = "high"
	PriorityNormal     TaskPriority = "normal"
	PriorityLow        TaskPriority = "low"
	PriorityBackground TaskPriority = "background"
)

var priorityValues = map[TaskPriority]int{
	PriorityCritical:   1000,
	PriorityHigh:       750,
	PriorityNormal:     500,
	PriorityLow:        250,
	PriorityBackground: 100,
}

// PriorityValue returns the numeric scheduling weight for a priority.
func PriorityValue(p TaskPriority) int {
	if v, ok := priorityValues[p]; ok {
		return v
	}
	return 500
}

// Task is a single unit of work in a DAG run.
type Task struct {
	ID             string            `json:"id"`
	RunID          string            `json:"runId"`
	Name           string            `json:"name"`
	Priority       TaskPriority      `json:"priority"`
	Status         TaskStatus        `json:"status"`
	Capability     string            `json:"capability"`
	Objective      string            `json:"objective"`
	AssignedAgentID string           `json:"assignedAgentId,omitempty"`
	TemporalID     string            `json:"temporalId,omitempty"`
	RetryCount     int               `json:"retryCount"`
	MaxRetries     int               `json:"maxRetries"`
	Metadata       map[string]string `json:"metadata"`
	Tags           []string          `json:"tags"`
	CreatedAt      time.Time         `json:"createdAt"`
	QueuedAt       *time.Time        `json:"queuedAt,omitempty"`
	AssignedAt     *time.Time        `json:"assignedAt,omitempty"`
	StartedAt      *time.Time        `json:"startedAt,omitempty"`
	CompletedAt    *time.Time        `json:"completedAt,omitempty"`
}

// DAGRun is the top-level execution of a compiled TaskDAG.
type DAGRun struct {
	ID             string            `json:"id"`
	DAGID          string            `json:"dagId"`
	TenantID       string            `json:"tenantId"`
	UserID         string            `json:"userId"`
	Status         RunStatus         `json:"status"`
	TaskStatuses   map[string]string `json:"taskStatuses"`
	TemporalRunID  string            `json:"temporalRunId,omitempty"`
	Input          map[string]any    `json:"input"`
	Output         map[string]any    `json:"output,omitempty"`
	StartedAt      *time.Time        `json:"startedAt,omitempty"`
	CompletedAt    *time.Time        `json:"completedAt,omitempty"`
	CreatedAt      time.Time         `json:"createdAt"`
	Metadata       map[string]string `json:"metadata"`
}

// SubmitRunRequest is the payload for submitting a new DAG run.
type SubmitRunRequest struct {
	DAGID    string            `json:"dagId"    binding:"required"`
	Input    map[string]any    `json:"input"`
	Priority TaskPriority      `json:"priority"`
	Metadata map[string]string `json:"metadata"`
}

// SubmitGoalRequest is the payload for the high-level goal endpoint.
// The planner decomposes the goal into a TaskDAG automatically.
type SubmitGoalRequest struct {
	Goal        string            `json:"goal"        binding:"required,min=5,max=4000"`
	Constraints map[string]any    `json:"constraints"`
	Metadata    map[string]string `json:"metadata"`
}

// GoalTaskSummary is a lightweight task summary returned with the goal response.
type GoalTaskSummary struct {
	ID         string       `json:"id"`
	Name       string       `json:"name"`
	Capability string       `json:"capability"`
	Objective  string       `json:"objective"`
	Priority   TaskPriority `json:"priority"`
	WaveIndex  int          `json:"waveIndex"`
}

// GoalResponse is returned from POST /api/v1/swarm/goal.
type GoalResponse struct {
	RunID             string            `json:"runId"`
	DAGID             string            `json:"dagId"`
	Status            RunStatus         `json:"status"`
	PlannerConfidence float64           `json:"plannerConfidence"`
	PlannerReasoning  string            `json:"plannerReasoning"`
	Tasks             []GoalTaskSummary `json:"tasks"`
	TotalWaves        int               `json:"totalWaves"`
}

// CompleteTaskRequest is the payload for marking a task complete.
type CompleteTaskRequest struct {
	Success    bool           `json:"success"    binding:"required"`
	Output     map[string]any `json:"output"`
	Error      string         `json:"error"`
	TokensUsed int            `json:"tokensUsed"`
	CostUsd    float64        `json:"costUsd"`
}
