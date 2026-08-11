// Package main is the entrypoint for the HiveSwarm API service.
// It exposes REST endpoints for agent registration, run submission, and real-time
// event streaming via WebSocket. Events are published to NATS JetStream and
// state is persisted in Redis.
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cerebro-hive/swarm-api/internal/api"
	swarmNats "github.com/cerebro-hive/swarm-api/internal/nats"
	"github.com/cerebro-hive/swarm-api/internal/store"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	// ── Logging ───────────────────────────────────────────────────────────────
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("LOG_FORMAT") != "json" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}
	logLevel, _ := zerolog.ParseLevel(getenv("LOG_LEVEL", "info"))
	zerolog.SetGlobalLevel(logLevel)

	// ── Redis ─────────────────────────────────────────────────────────────────
	rdb := redis.NewClient(&redis.Options{
		Addr:     getenv("REDIS_ADDR", "localhost:6379"),
		Password: getenv("REDIS_PASSWORD", ""),
		DB:       0,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal().Err(err).Msg("redis ping failed")
	}
	log.Info().Msg("redis connected")

	// ── NATS ──────────────────────────────────────────────────────────────────
	natsURL := getenv("NATS_URL", "nats://localhost:4222")
	publisher, err := swarmNats.NewSwarmPublisher(natsURL)
	if err != nil {
		log.Fatal().Err(err).Msg("nats connect failed")
	}
	defer publisher.Close()
	log.Info().Str("url", natsURL).Msg("nats connected")

	// ── Stores ────────────────────────────────────────────────────────────────
	agentStore := store.NewRedisAgentStore(rdb)
	runStore := store.NewRedisRunStore(rdb)
	taskStore := store.NewRedisTaskStore(rdb)

	// ── HTTP server ───────────────────────────────────────────────────────────
	plannerURL := getenv("PLANNER_SERVICE_URL", "http://planner-service:8920")
	handler := api.NewHandler(agentStore, runStore, taskStore, publisher, plannerURL)
	router := api.NewRouter(handler)

	port := getenv("PORT", "8910")
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", port),
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// ── Graceful shutdown ────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Info().Str("port", port).Msg("swarm-api listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("server error")
		}
	}()

	<-quit
	log.Info().Msg("shutting down swarm-api...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown failed")
	}
	log.Info().Msg("swarm-api stopped")
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
