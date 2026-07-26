// Package main is the entry point for the HiveSwarm tool-gateway.
//
// The tool-gateway maintains a registry of callable external tools, enforces
// per-tool rate limits via Redis, and proxies agent tool calls to the
// appropriate adapter with auth injection and circuit-breaking.
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cerebro/tool-gateway/internal/adapters"
	"github.com/cerebro/tool-gateway/internal/api"
	"github.com/cerebro/tool-gateway/internal/executor"
	"github.com/cerebro/tool-gateway/internal/ratelimit"
	"github.com/cerebro/tool-gateway/internal/registry"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnixMs
	if os.Getenv("LOG_LEVEL") == "debug" {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	} else {
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}

	ctx := context.Background()

	// ── Redis (for rate limiting) ──────────────────────────────────────────────
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: os.Getenv("REDIS_PASSWORD"),
		MaxRetries: 5,
		MinRetryBackoff: 200 * time.Millisecond,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal().Err(err).Str("addr", redisAddr).Msg("redis ping failed")
	}
	log.Info().Str("addr", redisAddr).Msg("redis connected")

	// ── Build components ───────────────────────────────────────────────────────
	reg := registry.New()          // seeded with all built-in tool definitions
	exec := executor.New()
	adapters.RegisterAll(exec)     // wire adapters to executor
	limiter := ratelimit.New(rdb)

	// ── HTTP server ────────────────────────────────────────────────────────────
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	h := api.New(reg, exec, limiter)
	h.RegisterRoutes(r)

	port := getEnv("TOOL_GATEWAY_PORT", "8940")
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 35 * time.Second, // tools can run up to 30s + buffer
	}

	go func() {
		log.Info().
			Str("port", port).
			Int("tools", len(reg.List())).
			Msg("tool-gateway listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("tool-gateway server error")
		}
	}()

	// ── Graceful shutdown ──────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down tool-gateway")

	shutCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown error")
	}
	rdb.Close()
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
