// Package main is the entry point for the HiveSwarm memory-service.
//
// The memory-service provides four memory tiers for AI agents:
// Working (Redis TTL), Semantic (pgvector), Long-term (PostgreSQL), Execution (Redis).
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/cerebro/memory-service/internal/api"
	"github.com/cerebro/memory-service/internal/search"
	"github.com/cerebro/memory-service/internal/store"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
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

	// ── Redis ──────────────────────────────────────────────────────────────────
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	rdb := redis.NewClient(&redis.Options{
		Addr:            redisAddr,
		Password:        os.Getenv("REDIS_PASSWORD"),
		MaxRetries:      5,
		MinRetryBackoff: 200 * time.Millisecond,
		MaxRetryBackoff: 2 * time.Second,
	})
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatal().Err(err).Str("addr", redisAddr).Msg("redis ping failed")
	}
	log.Info().Str("addr", redisAddr).Msg("redis connected")

	// ── PostgreSQL ─────────────────────────────────────────────────────────────
	pgURL := getEnv("DATABASE_URL",
		"postgres://cerebrohive:supersecretpassword123@localhost:5432/cerebrohive_db")
	pool, err := pgxpool.New(ctx, pgURL)
	if err != nil {
		log.Fatal().Err(err).Msg("pgx pool create failed")
	}
	if err := pool.Ping(ctx); err != nil {
		log.Fatal().Err(err).Msg("postgres ping failed")
	}
	log.Info().Msg("postgres connected")

	// Ensure table exists (idempotent bootstrap for dev; prod uses migrations)
	if err := ensureSchema(ctx, pool); err != nil {
		log.Fatal().Err(err).Msg("schema bootstrap failed")
	}

	// ── Stores ─────────────────────────────────────────────────────────────────
	workingStore := store.NewWorkingStore(rdb)
	longtermStore := store.NewLongTermStore(pool)
	searcher := search.New(pool)

	// ── HTTP ───────────────────────────────────────────────────────────────────
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	h := api.New(workingStore, longtermStore, searcher)
	h.RegisterRoutes(r)

	port := getEnv("MEMORY_PORT", "8930")
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	go func() {
		log.Info().Str("port", port).Msg("memory-service listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("memory-service server error")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down memory-service")

	shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutCtx); err != nil {
		log.Error().Err(err).Msg("graceful shutdown error")
	}
	pool.Close()
	rdb.Close()
}

func ensureSchema(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS swarm_memory (
			id          TEXT PRIMARY KEY,
			agent_id    TEXT NOT NULL,
			run_id      TEXT,
			task_id     TEXT,
			tier        TEXT NOT NULL,
			key         TEXT NOT NULL,
			content     TEXT NOT NULL,
			metadata    JSONB,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
			expires_at  TIMESTAMPTZ,
			UNIQUE (agent_id, key)
		);
		CREATE INDEX IF NOT EXISTS idx_swarm_memory_agent ON swarm_memory(agent_id);
	`)
	if err != nil {
		return fmt.Errorf("create swarm_memory table: %w", err)
	}
	return nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
