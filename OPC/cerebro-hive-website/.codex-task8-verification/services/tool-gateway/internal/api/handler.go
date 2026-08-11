// Package api provides HTTP handlers for the tool-gateway.
package api

import (
	"fmt"
	"net/http"

	"github.com/cerebro/tool-gateway/internal/executor"
	"github.com/cerebro/tool-gateway/internal/ratelimit"
	"github.com/cerebro/tool-gateway/internal/registry"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

// Handler wires the registry, executor, and rate limiter into HTTP endpoints.
type Handler struct {
	reg     *registry.Registry
	exec    *executor.Executor
	limiter *ratelimit.Limiter
}

// New creates a Handler.
func New(reg *registry.Registry, exec *executor.Executor, limiter *ratelimit.Limiter) *Handler {
	return &Handler{reg: reg, exec: exec, limiter: limiter}
}

// RegisterRoutes mounts all routes on the gin engine.
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	r.GET("/health", h.health)
	v1 := r.Group("/api/v1")
	{
		v1.GET("/tools", h.listTools)
		v1.GET("/tools/:toolId", h.getTool)
		v1.POST("/tools/:toolId/execute", h.execute)
	}
}

func (h *Handler) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "tool-gateway"})
}

// listTools godoc
//
//	@Summary	List all registered tools
//	@Tags		tools
//	@Produce	json
//	@Success	200	{array}		registry.ToolDefinition
//	@Router		/api/v1/tools [get]
func (h *Handler) listTools(c *gin.Context) {
	tools := h.reg.List()
	c.JSON(http.StatusOK, tools)
}

// getTool godoc
//
//	@Summary	Get a single tool definition
//	@Tags		tools
//	@Produce	json
//	@Param		toolId	path	string	true	"Tool ID"
//	@Success	200		{object}	registry.ToolDefinition
//	@Failure	404		{object}	map[string]string
//	@Router		/api/v1/tools/{toolId} [get]
func (h *Handler) getTool(c *gin.Context) {
	toolID := c.Param("toolId")
	def, ok := h.reg.Get(toolID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "tool not found: " + toolID})
		return
	}
	c.JSON(http.StatusOK, def)
}

// executeRequest is the JSON body for POST /api/v1/tools/{toolId}/execute.
type executeRequest struct {
	AgentID string         `json:"agentId" binding:"required"`
	RunID   string         `json:"runId"`
	Input   map[string]any `json:"input" binding:"required"`
}

// execute godoc
//
//	@Summary	Execute a tool call
//	@Tags		tools
//	@Accept		json
//	@Produce	json
//	@Param		toolId	path		string			true	"Tool ID"
//	@Param		body	body		executeRequest	true	"Execution request"
//	@Success	200		{object}	executor.ToolResult
//	@Failure	400		{object}	map[string]string
//	@Failure	404		{object}	map[string]string
//	@Failure	429		{object}	map[string]string
//	@Router		/api/v1/tools/{toolId}/execute [post]
func (h *Handler) execute(c *gin.Context) {
	toolID := c.Param("toolId")

	def, ok := h.reg.Get(toolID)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "tool not found: " + toolID})
		return
	}

	var req executeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Rate limiting
	allowed, remaining, err := h.limiter.Allow(
		c.Request.Context(), toolID, req.AgentID, def.RateLimit.RequestsPerMinute,
	)
	c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
	if err != nil {
		log.Warn().Err(err).Str("tool", toolID).Msg("rate limit check error — allowing")
	} else if !allowed {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error":     "rate limit exceeded",
			"toolId":    toolID,
			"remaining": remaining,
		})
		return
	}

	callID := uuid.New().String()
	result := h.exec.Execute(c.Request.Context(), executor.ToolCall{
		CallID:  callID,
		ToolID:  toolID,
		AgentID: req.AgentID,
		RunID:   req.RunID,
		Input:   req.Input,
	})

	log.Info().
		Str("tool_id", toolID).
		Str("call_id", callID).
		Str("agent_id", req.AgentID).
		Bool("error", result.IsError).
		Int64("duration_ms", result.DurationMs).
		Msg("tool.execute")

	status := http.StatusOK
	if result.IsError && result.ErrorCode == "UNKNOWN_TOOL" {
		status = http.StatusNotFound
	}
	c.JSON(status, result)
}
