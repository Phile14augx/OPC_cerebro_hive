package api

// Goal, task, and completion handlers for the swarm-api service.
// These power the high-level "submit a natural language goal → get a run" flow.

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/cerebro-hive/swarm-api/internal/domain"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

// TaskWave mirrors the temporal.TaskWave struct used by swarm-runtime.
type TaskWave struct {
	WaveIndex   int      `json:"waveIndex"`
	TaskIDs     []string `json:"taskIds"`
	HasParallel bool     `json:"hasParallel"`
}

// ── POST /api/v1/swarm/goal ───────────────────────────────────────────────────

// SubmitGoal accepts a natural-language goal, calls planner-service to produce
// a TaskDAG, stores tasks in Redis, creates a DAGRun, and publishes to NATS.
func (h *Handler) SubmitGoal(c *gin.Context) {
	var req domain.SubmitGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenantID := c.GetHeader("X-Tenant-ID")
	if tenantID == "" {
		tenantID = "default"
	}
	userID := c.GetHeader("X-User-ID")
	if userID == "" {
		userID = "user"
	}
	ctx := c.Request.Context()

	// 1. Call planner-service
	planResp, err := h.callPlanner(ctx, req.Goal, tenantID, userID, req.Constraints)
	if err != nil {
		log.Error().Err(err).Msg("planner-service call failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "planner failed: " + err.Error()})
		return
	}

	// 2. Allocate a run ID so tasks can reference it immediately
	runID := uuid.New().String()
	dagID := planResp.DAG.ID

	// 3. Build tasks + waves from planner output
	tasks, taskSummaries, waves := buildTasksAndWaves(planResp, runID)

	// 4. Persist tasks in Redis
	for _, t := range tasks {
		if err := h.tasks.Create(ctx, t); err != nil {
			log.Error().Err(err).Str("taskId", t.ID).Msg("failed to store task")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store tasks"})
			return
		}
	}

	// 5. Create DAGRun
	wavesJSON, _ := json.Marshal(waves)
	now := time.Now()
	run := &domain.DAGRun{
		ID:           runID,
		DAGID:        dagID,
		TenantID:     tenantID,
		UserID:       userID,
		Status:       domain.RunPending,
		TaskStatuses: make(map[string]string),
		Input: map[string]any{
			"goal":      req.Goal,
			"wavesJson": string(wavesJSON),
		},
		CreatedAt: now,
		Metadata:  req.Metadata,
	}
	if run.Metadata == nil {
		run.Metadata = make(map[string]string)
	}
	run.Metadata["plannerConfidence"] = fmt.Sprintf("%.2f", planResp.Confidence)
	run.Metadata["totalTasks"] = fmt.Sprintf("%d", len(tasks))
	run.Metadata["totalWaves"] = fmt.Sprintf("%d", len(waves))

	if err := h.runs.CreateRun(ctx, run); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create run"})
		return
	}

	// 6. Publish to NATS — swarm-runtime starts the Temporal DAGRunWorkflow
	_ = h.publisher.PublishEvent(ctx,
		"swarm.run.created",
		"swarm.run.created",
		tenantID,
		gin.H{
			"runId":     runID,
			"dagId":     dagID,
			"userId":    userID,
			"wavesJson": string(wavesJSON),
			"input":     map[string]any{"goal": req.Goal},
		},
	)

	h.hub.broadcast(WSMessage{Type: "run.created", Payload: run})

	c.JSON(http.StatusCreated, domain.GoalResponse{
		RunID:             runID,
		DAGID:             dagID,
		Status:            domain.RunPending,
		PlannerConfidence: planResp.Confidence,
		PlannerReasoning:  planResp.Reasoning,
		Tasks:             taskSummaries,
		TotalWaves:        len(waves),
	})
}

// ── GET /api/v1/swarm/tasks/:id ───────────────────────────────────────────────

// GetTask returns full task details — agents call this after receiving a taskId.
func (h *Handler) GetTask(c *gin.Context) {
	task, err := h.tasks.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}
	c.JSON(http.StatusOK, task)
}

// ── POST /api/v1/swarm/tasks/:id/complete ────────────────────────────────────

// CompleteTask is called by agent-runner after executing a task.
func (h *Handler) CompleteTask(c *gin.Context) {
	var req domain.CompleteTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	taskID := c.Param("id")
	ctx := c.Request.Context()

	task, err := h.tasks.Get(ctx, taskID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	finalStatus := domain.TaskCompleted
	if !req.Success {
		finalStatus = domain.TaskFailed
	}

	if err := h.tasks.Complete(ctx, taskID, req.Output, req.TokensUsed, req.CostUsd); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to complete task"})
		return
	}
	_ = h.runs.UpdateTaskStatus(ctx, task.RunID, taskID, finalStatus)

	h.hub.broadcast(WSMessage{
		Type:    "task.completed",
		Payload: gin.H{"taskId": taskID, "runId": task.RunID, "success": req.Success},
	})

	c.JSON(http.StatusOK, gin.H{"ok": true, "taskId": taskID, "status": string(finalStatus)})
}

// ── GET /api/v1/swarm/runs/:id/tasks ─────────────────────────────────────────

// ListRunTasks returns all tasks for a given run.
func (h *Handler) ListRunTasks(c *gin.Context) {
	tasks, err := h.tasks.ListByRun(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tasks, "count": len(tasks)})
}

// ── Planner client ────────────────────────────────────────────────────────────

// plannerDAGNode mirrors the planner-service TaskNode response shape.
type plannerDAGNode struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Priority    string         `json:"priority"`
	Capability  struct {
		Capability string `json:"capability"`
	} `json:"capability"`
	Input map[string]any `json:"input"`
}

// plannerDAGEdge mirrors the planner-service TaskEdge response shape.
type plannerDAGEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Type   string `json:"type"`
}

// plannerDAG is the DAG portion of the planner response.
type plannerDAG struct {
	ID         string           `json:"id"`
	Name       string           `json:"name"`
	Nodes      []plannerDAGNode `json:"nodes"`
	Edges      []plannerDAGEdge `json:"edges"`
	EntryNodes []string         `json:"entry_nodes"`
	ExitNodes  []string         `json:"exit_nodes"`
}

// plannerPlanResponse is the full planner-service /plan response.
type plannerPlanResponse struct {
	DAG        plannerDAG `json:"dag"`
	Confidence float64    `json:"confidence"`
	Reasoning  string     `json:"reasoning"`
}

func (h *Handler) callPlanner(
	ctx context.Context,
	goal, tenantID, userID string,
	constraints map[string]any,
) (*plannerPlanResponse, error) {
	if constraints == nil {
		constraints = map[string]any{"max_tasks": 8}
	}

	body, err := json.Marshal(map[string]any{
		"goal":        goal,
		"tenant_id":   tenantID,
		"user_id":     userID,
		"constraints": constraints,
		"context":     map[string]any{},
	})
	if err != nil {
		return nil, err
	}

	plannerURL := h.plannerURL
	if plannerURL == "" {
		plannerURL = "http://planner-service:8920"
	}

	httpCtx, cancel := context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(httpCtx, http.MethodPost, plannerURL+"/plan", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("planner request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("planner returned HTTP %d", resp.StatusCode)
	}

	var planResp plannerPlanResponse
	if err := json.NewDecoder(resp.Body).Decode(&planResp); err != nil {
		return nil, fmt.Errorf("decode planner response: %w", err)
	}
	return &planResp, nil
}

// ── DAG → tasks + waves ───────────────────────────────────────────────────────

// buildTasksAndWaves converts a planner DAG into stored Tasks and execution waves.
func buildTasksAndWaves(
	resp *plannerPlanResponse,
	runID string,
) ([]*domain.Task, []domain.GoalTaskSummary, []TaskWave) {
	dag := resp.DAG
	now := time.Now()

	// Map planner node ID → new swarm task ID
	nodeToTask := make(map[string]string, len(dag.Nodes))
	for _, node := range dag.Nodes {
		nodeToTask[node.ID] = uuid.New().String()
	}

	// Build task objects
	tasks := make([]*domain.Task, 0, len(dag.Nodes))
	for _, node := range dag.Nodes {
		taskID := nodeToTask[node.ID]
		priority := parsePriority(node.Priority)

		input := node.Input
		if input == nil {
			input = make(map[string]any)
		}
		input["objective"] = node.Description

		tasks = append(tasks, &domain.Task{
			ID:         taskID,
			RunID:      runID,
			Name:       node.Name,
			Priority:   priority,
			Status:     domain.TaskPending,
			Capability: node.Capability.Capability,
			Objective:  node.Description,
			MaxRetries: 2,
			Metadata:   map[string]string{"plannerNodeId": node.ID},
			Tags:       []string{},
			CreatedAt:  now,
		})
	}

	// Compute execution waves (Kahn's topological sort)
	waves := topoWaves(dag.Nodes, dag.Edges, nodeToTask)

	// Build wave-index lookup for summaries
	taskWaveIdx := make(map[string]int, len(tasks))
	for wi, w := range waves {
		for _, tid := range w.TaskIDs {
			taskWaveIdx[tid] = wi
		}
	}

	summaries := make([]domain.GoalTaskSummary, 0, len(tasks))
	for _, t := range tasks {
		summaries = append(summaries, domain.GoalTaskSummary{
			ID:         t.ID,
			Name:       t.Name,
			Capability: t.Capability,
			Objective:  t.Objective,
			Priority:   t.Priority,
			WaveIndex:  taskWaveIdx[t.ID],
		})
	}
	sort.Slice(summaries, func(i, j int) bool {
		if summaries[i].WaveIndex != summaries[j].WaveIndex {
			return summaries[i].WaveIndex < summaries[j].WaveIndex
		}
		return summaries[i].Name < summaries[j].Name
	})

	return tasks, summaries, waves
}

// topoWaves groups task IDs into parallel execution waves using Kahn's algorithm.
func topoWaves(nodes []plannerDAGNode, edges []plannerDAGEdge, nodeToTask map[string]string) []TaskWave {
	// Build in-degree and adjacency list (using planner node IDs)
	inDeg := make(map[string]int, len(nodes))
	children := make(map[string][]string, len(nodes))
	for _, n := range nodes {
		inDeg[n.ID] = 0
	}
	for _, e := range edges {
		inDeg[e.Target]++
		children[e.Source] = append(children[e.Source], e.Target)
	}

	// Seed: all nodes with no dependencies
	var current []string
	for _, n := range nodes {
		if inDeg[n.ID] == 0 {
			current = append(current, n.ID)
		}
	}
	sort.Strings(current) // deterministic ordering within a wave

	var waves []TaskWave
	for len(current) > 0 {
		// Convert planner node IDs to task IDs for this wave
		taskIDs := make([]string, 0, len(current))
		for _, nodeID := range current {
			if tid, ok := nodeToTask[nodeID]; ok {
				taskIDs = append(taskIDs, tid)
			}
		}
		sort.Strings(taskIDs)
		waves = append(waves, TaskWave{
			WaveIndex:   len(waves),
			TaskIDs:     taskIDs,
			HasParallel: len(taskIDs) > 1,
		})

		// Reduce in-degree for successors
		var next []string
		for _, nodeID := range current {
			for _, child := range children[nodeID] {
				inDeg[child]--
				if inDeg[child] == 0 {
					next = append(next, child)
				}
			}
		}
		sort.Strings(next)
		current = next
	}

	// Fallback: if the DAG had no edges, put all tasks in one wave
	if len(waves) == 0 && len(nodes) > 0 {
		taskIDs := make([]string, 0, len(nodes))
		for _, tid := range nodeToTask {
			taskIDs = append(taskIDs, tid)
		}
		sort.Strings(taskIDs)
		waves = []TaskWave{{WaveIndex: 0, TaskIDs: taskIDs, HasParallel: len(taskIDs) > 1}}
	}

	return waves
}

func parsePriority(s string) domain.TaskPriority {
	switch strings.ToLower(s) {
	case "critical":
		return domain.PriorityCritical
	case "high":
		return domain.PriorityHigh
	case "low":
		return domain.PriorityLow
	case "background":
		return domain.PriorityBackground
	default:
		return domain.PriorityNormal
	}
}
