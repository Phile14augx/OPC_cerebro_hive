// Package api contains Gin HTTP handlers for the swarm-api service.
package api

import (
	"net/http"
	"time"

	"github.com/cerebro-hive/swarm-api/internal/domain"
	swarmNats "github.com/cerebro-hive/swarm-api/internal/nats"
	"github.com/cerebro-hive/swarm-api/internal/store"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:     func(_ *http.Request) bool { return true },
	ReadBufferSize:  1024,
	WriteBufferSize: 4096,
}

// Handler holds all dependencies for the HTTP API.
type Handler struct {
	agents     store.AgentStore
	runs       store.RunStore
	tasks      store.TaskStore
	publisher  *swarmNats.SwarmPublisher
	hub        *WSHub
	plannerURL string // base URL of planner-service, e.g. "http://planner-service:8920"
}

// NewHandler creates a new Handler.
func NewHandler(
	agents store.AgentStore,
	runs store.RunStore,
	tasks store.TaskStore,
	pub *swarmNats.SwarmPublisher,
	plannerURL string,
) *Handler {
	hub := newWSHub()
	go hub.run()
	return &Handler{
		agents:     agents,
		runs:       runs,
		tasks:      tasks,
		publisher:  pub,
		hub:        hub,
		plannerURL: plannerURL,
	}
}

// ── Agent endpoints ───────────────────────────────────────────────────────────

// RegisterAgent godoc
// POST /api/v1/swarm/agents
func (h *Handler) RegisterAgent(c *gin.Context) {
	var req domain.AgentRegistration
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	agent := &domain.Agent{
		ID:           uuid.New().String(),
		Name:         req.Name,
		Version:      req.Version,
		Owner:        req.Owner,
		Capabilities: req.Capabilities,
		Tags:         req.Tags,
		Concurrency:  req.Concurrency,
		Status:       domain.AgentStatusActive,
		Health:       domain.HealthHealthy,
		Endpoint:     req.Endpoint,
		Metadata:     req.Metadata,
		RegisteredAt: now,
		LastSeenAt:   now,
		UpdatedAt:    now,
	}
	if agent.Metadata == nil {
		agent.Metadata = make(map[string]string)
	}
	if agent.Tags == nil {
		agent.Tags = []string{}
	}

	if err := h.agents.Register(c.Request.Context(), agent); err != nil {
		log.Error().Err(err).Msg("failed to register agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to register agent"})
		return
	}

	// Broadcast to dashboard WebSocket subscribers
	h.hub.broadcast(WSMessage{
		Type:    "agent.registered",
		Payload: agent,
	})

	_ = h.publisher.PublishEvent(c.Request.Context(),
		"swarm.agent.registered",
		"swarm.agent.registered",
		c.GetHeader("X-Tenant-ID"),
		agent,
	)

	c.JSON(http.StatusCreated, agent)
}

// ListAgents godoc
// GET /api/v1/swarm/agents
func (h *Handler) ListAgents(c *gin.Context) {
	filter := domain.AgentFilter{
		Capability: c.Query("capability"),
		Limit:      100,
	}
	if c.Query("status") != "" {
		filter.Status = domain.AgentStatus(c.Query("status"))
	}

	agents, err := h.agents.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": agents, "count": len(agents)})
}

// GetAgent godoc
// GET /api/v1/swarm/agents/:id
func (h *Handler) GetAgent(c *gin.Context) {
	agent, err := h.agents.Get(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "agent not found"})
		return
	}
	c.JSON(http.StatusOK, agent)
}

// DeregisterAgent godoc
// DELETE /api/v1/swarm/agents/:id
func (h *Handler) DeregisterAgent(c *gin.Context) {
	if err := h.agents.Deregister(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "agent not found"})
		return
	}
	_ = h.publisher.PublishEvent(c.Request.Context(),
		"swarm.agent.deregistered",
		"swarm.agent.deregistered",
		c.GetHeader("X-Tenant-ID"),
		gin.H{"agentId": c.Param("id")},
	)
	c.JSON(http.StatusOK, gin.H{"message": "agent deregistered"})
}

// HeartbeatAgent godoc
// PATCH /api/v1/swarm/agents/:id/heartbeat
func (h *Handler) HeartbeatAgent(c *gin.Context) {
	var body struct {
		Health     domain.AgentHealth `json:"health"`
		ActiveRuns int                `json:"activeRuns"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.agents.UpdateHealth(c.Request.Context(), c.Param("id"), body.Health, body.ActiveRuns); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "agent not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ── Run endpoints ─────────────────────────────────────────────────────────────

// SubmitRun godoc
// POST /api/v1/swarm/runs
func (h *Handler) SubmitRun(c *gin.Context) {
	var req domain.SubmitRunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tenantID := c.GetHeader("X-Tenant-ID")
	userID := c.GetHeader("X-User-ID")

	now := time.Now()
	run := &domain.DAGRun{
		ID:           uuid.New().String(),
		DAGID:        req.DAGID,
		TenantID:     tenantID,
		UserID:       userID,
		Status:       domain.RunPending,
		TaskStatuses: make(map[string]string),
		Input:        req.Input,
		CreatedAt:    now,
		Metadata:     req.Metadata,
	}
	if run.Metadata == nil {
		run.Metadata = make(map[string]string)
	}

	if err := h.runs.CreateRun(c.Request.Context(), run); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create run"})
		return
	}

	// Publish to NATS so swarm-runtime picks it up
	_ = h.publisher.PublishEvent(c.Request.Context(),
		"swarm.run.created",
		"swarm.run.created",
		tenantID,
		gin.H{"runId": run.ID, "dagId": run.DAGID, "userId": run.UserID, "input": run.Input},
	)

	h.hub.broadcast(WSMessage{Type: "run.created", Payload: run})

	c.JSON(http.StatusCreated, run)
}

// GetRun godoc
// GET /api/v1/swarm/runs/:id
func (h *Handler) GetRun(c *gin.Context) {
	run, err := h.runs.GetRun(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "run not found"})
		return
	}
	c.JSON(http.StatusOK, run)
}

// ListRuns godoc
// GET /api/v1/swarm/runs
func (h *Handler) ListRuns(c *gin.Context) {
	tenantID := c.GetHeader("X-Tenant-ID")
	runs, err := h.runs.ListRuns(c.Request.Context(), tenantID, 50, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": runs, "count": len(runs)})
}

// ── WebSocket ─────────────────────────────────────────────────────────────────

// StreamEvents godoc
// GET /api/v1/swarm/events/ws
func (h *Handler) StreamEvents(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Error().Err(err).Msg("websocket upgrade failed")
		return
	}
	client := &WSClient{hub: h.hub, conn: conn, send: make(chan WSMessage, 128)}
	h.hub.register <- client
	go client.writePump()
	client.readPump()
}

// ── Health ─────────────────────────────────────────────────────────────────────

// Health godoc
// GET /health
func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"service":   "swarm-api",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}
