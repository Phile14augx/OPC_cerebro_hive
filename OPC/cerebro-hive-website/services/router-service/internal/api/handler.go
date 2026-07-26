// Package api provides the HTTP handlers for the router-service.
package api

import (
	"net/http"

	"github.com/cerebro/router-service/internal/registry"
	"github.com/cerebro/router-service/internal/router"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

// Handler holds dependencies for HTTP handlers.
type Handler struct {
	reg *registry.Reader
}

// New creates a Handler.
func New(reg *registry.Reader) *Handler {
	return &Handler{reg: reg}
}

// RegisterRoutes mounts all routes on the given router group.
func (h *Handler) RegisterRoutes(r *gin.Engine) {
	r.GET("/health", h.health)
	v1 := r.Group("/api/v1")
	{
		v1.POST("/route", h.route)
	}
}

// health godoc
//
//	@Summary	Health check
//	@Tags		ops
//	@Produce	json
//	@Success	200	{object}	map[string]string
//	@Router		/health [get]
func (h *Handler) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "router-service"})
}

// routeRequest is the JSON body for POST /api/v1/route.
type routeRequest struct {
	Capability     string  `json:"capability"     binding:"required"`
	MinProficiency float64 `json:"minProficiency"`
	MaxCostUSD     float64 `json:"maxCostUsd"`
	MaxLatencyMs   float64 `json:"maxLatencyMs"`
	PreferAgentID  string  `json:"preferAgentId"`
}

// route godoc
//
//	@Summary	Route a task to the best available agent
//	@Tags		router
//	@Accept		json
//	@Produce	json
//	@Param		body	body		routeRequest	true	"Routing criteria"
//	@Success	200		{object}	router.RouteResult
//	@Failure	400		{object}	map[string]string
//	@Failure	404		{object}	map[string]string
//	@Failure	500		{object}	map[string]string
//	@Router		/api/v1/route [post]
func (h *Handler) route(c *gin.Context) {
	var req routeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := router.Select(c.Request.Context(), h.reg, router.RouteRequest{
		Capability:     req.Capability,
		MinProficiency: req.MinProficiency,
		MaxCostUSD:     req.MaxCostUSD,
		MaxLatencyMs:   req.MaxLatencyMs,
		PreferAgentID:  req.PreferAgentID,
	})
	if err != nil {
		log.Warn().Err(err).Str("capability", req.Capability).Msg("router.select failed")
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	log.Info().
		Str("capability", req.Capability).
		Str("agent_id", result.AgentID).
		Float64("score", result.Score).
		Msg("router.routed")

	c.JSON(http.StatusOK, result)
}
