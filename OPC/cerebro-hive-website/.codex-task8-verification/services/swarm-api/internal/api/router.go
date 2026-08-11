package api

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

// NewRouter builds and returns the Gin router.
func NewRouter(h *Handler) *gin.Engine {
	r := gin.New()

	r.Use(ginLogger())
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())

	// Health
	r.GET("/health", h.Health)
	r.GET("/ready", h.Health)

	v1 := r.Group("/api/v1/swarm")
	{
		// Agent registry
		agents := v1.Group("/agents")
		{
			agents.POST("", h.RegisterAgent)
			agents.GET("", h.ListAgents)
			agents.GET("/:id", h.GetAgent)
			agents.DELETE("/:id", h.DeregisterAgent)
			agents.PATCH("/:id/heartbeat", h.HeartbeatAgent)
		}

		// High-level goal submission (calls planner, creates tasks + run)
		v1.POST("/goal", h.SubmitGoal)

		// Individual task endpoints (used by agents)
		tasks := v1.Group("/tasks")
		{
			tasks.GET("/:id", h.GetTask)
			tasks.POST("/:id/complete", h.CompleteTask)
		}

		// DAG runs
		runs := v1.Group("/runs")
		{
			runs.POST("", h.SubmitRun)
			runs.GET("", h.ListRuns)
			runs.GET("/:id", h.GetRun)
			runs.GET("/:id/tasks", h.ListRunTasks)
		}

		// Real-time event stream
		v1.GET("/events/ws", h.StreamEvents)
	}

	return r
}

// ginLogger is a zerolog-based request logger middleware.
func ginLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Info().
			Int("status", c.Writer.Status()).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Dur("latency", time.Since(start)).
			Str("ip", c.ClientIP()).
			Msg("request")
	}
}

// corsMiddleware adds permissive CORS headers for development.
// Tighten via allowed origins env var in production.
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID, X-User-ID")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
