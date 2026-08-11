// Package executor dispatches tool calls to the appropriate adapter.
//
// Each tool ID is mapped to an Adapter implementation. Adapters are registered
// at startup by the adapters package. Unknown tool IDs return ErrUnknownTool.
package executor

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

// ErrUnknownTool is returned when no adapter is registered for a tool ID.
var ErrUnknownTool = errors.New("unknown tool")

// ToolCall is the inbound execution request from an agent.
type ToolCall struct {
	CallID  string            `json:"callId"`
	ToolID  string            `json:"toolId"`
	AgentID string            `json:"agentId"`
	RunID   string            `json:"runId"`
	Input   map[string]any    `json:"input"`
}

// ToolResult is what the gateway returns to the agent after execution.
type ToolResult struct {
	CallID    string        `json:"callId"`
	ToolID    string        `json:"toolId"`
	Output    any           `json:"output"`
	IsError   bool          `json:"isError"`
	ErrorCode string        `json:"errorCode,omitempty"`
	Message   string        `json:"message,omitempty"`
	DurationMs int64        `json:"durationMs"`
}

// Adapter is the interface each tool integration must implement.
type Adapter interface {
	Execute(ctx context.Context, input map[string]any) (any, error)
}

// Executor dispatches tool calls to registered adapters.
type Executor struct {
	mu       sync.RWMutex
	adapters map[string]Adapter
}

// New creates an Executor with no adapters registered.
func New() *Executor {
	return &Executor{adapters: make(map[string]Adapter)}
}

// Register associates a tool ID with an Adapter.
func (e *Executor) Register(toolID string, adapter Adapter) {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.adapters[toolID] = adapter
}

// Execute runs a ToolCall, returning a ToolResult in all cases (never errors).
// Execution errors are embedded in ToolResult.IsError + Message.
func (e *Executor) Execute(ctx context.Context, call ToolCall) ToolResult {
	t0 := time.Now()

	e.mu.RLock()
	adapter, ok := e.adapters[call.ToolID]
	e.mu.RUnlock()

	if !ok {
		return ToolResult{
			CallID:     call.CallID,
			ToolID:     call.ToolID,
			IsError:    true,
			ErrorCode:  "UNKNOWN_TOOL",
			Message:    fmt.Sprintf("no adapter registered for tool %q", call.ToolID),
			DurationMs: time.Since(t0).Milliseconds(),
		}
	}

	// Per-tool 30-second execution timeout
	execCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	output, err := adapter.Execute(execCtx, call.Input)
	elapsed := time.Since(t0).Milliseconds()

	if err != nil {
		code := "EXECUTION_ERROR"
		if errors.Is(err, context.DeadlineExceeded) {
			code = "TIMEOUT"
		} else if errors.Is(err, context.Canceled) {
			code = "CANCELLED"
		}
		return ToolResult{
			CallID:     call.CallID,
			ToolID:     call.ToolID,
			IsError:    true,
			ErrorCode:  code,
			Message:    err.Error(),
			DurationMs: elapsed,
		}
	}

	return ToolResult{
		CallID:     call.CallID,
		ToolID:     call.ToolID,
		Output:     output,
		DurationMs: elapsed,
	}
}
