// Package main is the entrypoint for the HiveSwarm Runtime service.
//
// Responsibilities:
//  1. NATS consumer — listens for swarm.run.created events
//  2. Temporal worker — executes DAGRunWorkflow + task activities
//  3. Priority scheduler — orders task dispatch
//  4. Worker pool — concurrent task execution via agent endpoints
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	swarmNats "github.com/cerebro-hive/swarm-runtime/internal/nats"
	"github.com/cerebro-hive/swarm-runtime/internal/scheduler"
	swarmTemporal "github.com/cerebro-hive/swarm-runtime/internal/temporal"
	"github.com/cerebro-hive/swarm-runtime/internal/worker"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	temporalClient "go.temporal.io/sdk/client"
	temporalWorker "go.temporal.io/sdk/worker"
)

const temporalTaskQueue = "hiveswarm"

func main() {
	// ── Logging ───────────────────────────────────────────────────────────────
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	if os.Getenv("LOG_FORMAT") != "json" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}
	logLevel, _ := zerolog.ParseLevel(getenv("LOG_LEVEL", "info"))
	zerolog.SetGlobalLevel(logLevel)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ── Redis ─────────────────────────────────────────────────────────────────
	rdb := redis.NewClient(&redis.Options{
		Addr:     getenv("REDIS_ADDR", "localhost:6379"),
		Password: getenv("REDIS_PASSWORD", ""),
	})
	pingCtx, pingCancel := context.WithTimeout(ctx, 5*time.Second)
	defer pingCancel()
	if err := rdb.Ping(pingCtx).Err(); err != nil {
		log.Fatal().Err(err).Msg("redis ping failed")
	}
	log.Info().Msg("redis connected")

	// ── Temporal worker ───────────────────────────────────────────────────────
	tc, err := temporalClient.Dial(temporalClient.Options{
		HostPort: getenv("TEMPORAL_HOST", "localhost:7233"),
	})
	if err != nil {
		log.Fatal().Err(err).Msg("temporal connect failed")
	}
	defer tc.Close()

	tw := temporalWorker.New(tc, temporalTaskQueue, temporalWorker.Options{
		MaxConcurrentActivityExecutionSize:     50,
		MaxConcurrentWorkflowTaskExecutionSize: 20,
	})

	// Register workflow
	tw.RegisterWorkflow(swarmTemporal.DAGRunWorkflow)

	// Register all activities as methods on the Activities struct
	acts := swarmTemporal.NewActivities(rdb, getenv("SWARM_API_URL", "http://localhost:8910"))
	tw.RegisterActivity(acts)

	if err := tw.Start(); err != nil {
		log.Fatal().Err(err).Msg("temporal worker start failed")
	}
	defer tw.Stop()
	log.Info().Str("taskQueue", temporalTaskQueue).Msg("temporal worker started")

	// ── Priority scheduler ────────────────────────────────────────────────────
	sched := scheduler.New()
	defer sched.Stop()

	// ── Worker pool ───────────────────────────────────────────────────────────
	poolConcurrency := getenvInt("WORKER_CONCURRENCY", 20)
	pool := worker.New(
		poolConcurrency,
		worker.NewHTTPDispatcher(),
		&redisAgentLookup{rdb: rdb},
		&temporalResultHandler{tc: tc},
	)
	go pool.Run(ctx, sched.Ready())
	log.Info().Int("concurrency", poolConcurrency).Msg("worker pool started")

	// ── NATS consumer ─────────────────────────────────────────────────────────
	natsURL := getenv("NATS_URL", "nats://localhost:4222")
	consumer, err := swarmNats.New(natsURL, "swarm-runtime",
		func(ctx context.Context, payload swarmNats.RunCreatedPayload) error {
			return handleRunCreated(ctx, tc, payload)
		},
	)
	if err != nil {
		log.Fatal().Err(err).Msg("nats connect failed")
	}
	defer consumer.Close()

	go func() {
		if err := consumer.Subscribe(ctx); err != nil {
			log.Error().Err(err).Msg("nats consumer error")
		}
	}()
	log.Info().Str("nats", natsURL).Msg("swarm consumer started")

	// ── Graceful shutdown ─────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	<-quit
	log.Info().Msg("shutting down swarm-runtime...")
	cancel()
	time.Sleep(2 * time.Second)
	log.Info().Msg("swarm-runtime stopped")
}

// handleRunCreated starts a Temporal DAGRunWorkflow for a new run event.
func handleRunCreated(ctx context.Context, tc temporalClient.Client, payload swarmNats.RunCreatedPayload) error {
	p := payload.Payload
	runID, _ := p["runId"].(string)
	dagID, _ := p["dagId"].(string)
	userID, _ := p["userId"].(string)
	wavesJSON, _ := p["wavesJson"].(string)

	// Also check inside nested "input" map (legacy path)
	if wavesJSON == "" {
		if input, ok := p["input"].(map[string]any); ok {
			wavesJSON, _ = input["wavesJson"].(string)
		}
	}

	log.Info().
		Str("runId", runID).
		Str("dagId", dagID).
		Int("wavesLen", len(wavesJSON)).
		Msg("starting Temporal DAGRunWorkflow")

	opts := temporalClient.StartWorkflowOptions{
		ID:        fmt.Sprintf("dag-run-%s", runID),
		TaskQueue: temporalTaskQueue,
	}
	_, err := tc.ExecuteWorkflow(ctx, opts, swarmTemporal.DAGRunWorkflow, swarmTemporal.DAGRunInput{
		RunID:     runID,
		DAGID:     dagID,
		TenantID:  payload.TenantID,
		UserID:    userID,
		WavesJSON: wavesJSON,
	})
	return err
}

// ── Adapters ──────────────────────────────────────────────────────────────────

// redisAgentLookup implements worker.AgentLookup.
type redisAgentLookup struct{ rdb *redis.Client }

func (l *redisAgentLookup) FindEndpoint(ctx context.Context, capability string) (agentID, endpoint string, err error) {
	members, err := l.rdb.SMembers(ctx, "swarm:agents:cap:"+capability).Result()
	if err != nil || len(members) == 0 {
		return "", "", fmt.Errorf("no agent for capability %s", capability)
	}
	agentID = members[0]
	agentJSON, err := l.rdb.Get(ctx, "swarm:agent:"+agentID).Bytes()
	if err != nil {
		return "", "", fmt.Errorf("agent %s not found: %w", agentID, err)
	}
	var data map[string]any
	if err := json.Unmarshal(agentJSON, &data); err != nil {
		return "", "", err
	}
	ep, _ := data["endpoint"].(string)
	return agentID, ep, nil
}

// temporalResultHandler signals the Temporal workflow on task completion.
type temporalResultHandler struct{ tc temporalClient.Client }

func (h *temporalResultHandler) OnComplete(ctx context.Context, result *worker.TaskResult) {
	log.Info().Str("taskId", result.TaskID).Bool("success", result.Success).Msg("task complete")
	_ = h.tc.SignalWorkflow(ctx,
		fmt.Sprintf("dag-run-%s", result.RunID),
		"",
		"task.complete",
		result,
	)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		var n int
		if _, err := fmt.Sscanf(v, "%d", &n); err == nil {
			return n
		}
	}
	return fallback
}
