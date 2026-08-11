// Package main is the entry point for the HiveSwarm router-service.
//
// The router-service selects the optimal registered agent for a given task
// capability, respecting load, cost, and latency constraints.
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cerebro/router-service/internal/api"
	"github.com/cerebro/router-service/internal/registry"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// ── Logging ────────────────────────────────────────────────────────────────
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnixMs
	if os.Getenv("LOG_LEVEL") == "debug" {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	} else {
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}

	// ── Redis ──────────────────────────────────────────────────────────────────
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	rdb := redis.NewClient(&redis.Options{
		Addr:            redisAddr,
		MaxRetries:      5,
		MinRetryBackoff: 200 * time.Millisecond,
		MaxRetryBackoff: 2 * time.Second,
		DialTimeout:     5 * time.Second,
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal().Err(err).Str("addr", redisAddr).Msg("redis ping failed")
	}
	log.Info().Str("addr", redisAddr).Msg("redis connected")

	// ── Registry reader ────────────────────────────────────────────────────────
	reg := registry.New(rdb)

	// ── HTTP server ────────────────────────────────────────────────────────────
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	h := api.New(reg)
	h.RegisterRoutes(r)

	port := getEnv("ROUTER_PORT", "8921")
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Info().Str("port", port).Msg("router-service listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("router-service failed")
		}
	}()

	// ── Graceful shutdown ──────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down router-service")

	shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown error")
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
