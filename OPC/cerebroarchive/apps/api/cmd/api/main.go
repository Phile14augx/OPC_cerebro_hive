package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	domain_ai "github.com/cerebro/cerebroarchive/apps/api/internal/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/archive"
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/auth"
	"github.com/cerebro/cerebroarchive/apps/api/internal/common/validation"
	"github.com/cerebro/cerebroarchive/apps/api/internal/identity"
	platform_ai "github.com/cerebro/cerebroarchive/apps/api/internal/platform/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/config"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/logger"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/storage"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/vector"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	Config *config.Config
	Logger *slog.Logger
	DB     *pgxpool.Pool
	Fiber  *fiber.App

	IdentityService *identity.Service
}

func main() {
	cfg := config.Load()
	log := logger.New(cfg.Environment)

	log.Info("Starting CerebroArchive API", "env", cfg.Environment)

	app := &App{
		Config: cfg,
		Logger: log,
		Fiber:  fiber.New(fiber.Config{DisableStartupMessage: true}),
	}

	app.Logger.Info("loaded configuration", "env", cfg.Environment)

	// Database Connection with Retry
	connString := "postgres://postgres:password@localhost:5432/cerebro?sslmode=disable"
	var dbPool *pgxpool.Pool
	var err error
	for i := 0; i < 5; i++ {
		dbPool, err = pgxpool.New(context.Background(), connString)
		if err == nil {
			err = dbPool.Ping(context.Background())
			if err == nil {
				break
			}
		}
		app.Logger.Warn("database not ready, retrying...", "attempt", i+1)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		app.Logger.Error("failed to connect to database after retries", "error", err)
		os.Exit(1)
	}
	defer dbPool.Close()

	app.Logger.Info("successfully connected to database")
	app.DB = dbPool

	bootstrap(app)

	log.Info("Listening", "port", cfg.HTTPPort)
	if err := app.Fiber.Listen(":" + cfg.HTTPPort); err != nil {
		log.Error("Server failed", "err", err)
		os.Exit(1)
	}
}

func bootstrap(app *App) {
	validator := validation.NewValidator()

	// Auth primitives
	hasher := auth.NewBcryptHasher(0) // 0 = bcrypt.DefaultCost
	tokenProvider := auth.NewJWTProvider(app.Config.JWTSecret, "cerebro-archive")

	// Identity Domain
	identityRepo := identity.NewRepository(app.DB)
	app.IdentityService = identity.NewService(identityRepo, app.Logger, hasher, tokenProvider)
	identityHandler := identity.NewHandler(app.IdentityService, validator)

	// Archive Domain
	blobStorage := storage.NewS3Storage("cerebro-documents-bucket")
	archiveRepo := archive.NewPostgresRepository(app.DB)
	archiveService := archive.NewService(archiveRepo, blobStorage, app.Logger)
	archiveHandler := archive.NewHandler(archiveService, validator)

	// AI Domain
	pineconeStore := vector.NewPineconeStore("cerebro-index")
	openAIClient := platform_ai.NewOpenAIClient()
	aiService := domain_ai.NewService(openAIClient, pineconeStore, openAIClient, app.Logger)
	aiHandler := domain_ai.NewHandler(aiService, validator)

	// Mount Routes
	api := app.Fiber.Group("/api/v1")

	// Health check endpoints (Kubernetes friendly)
	health := api.Group("/health")
	health.Get("/live", func(c *fiber.Ctx) error { return c.SendString("OK") })
	health.Get("/ready", func(c *fiber.Ctx) error {
		if err := app.DB.Ping(context.Background()); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).SendString("DB UNHEALTHY")
		}
		return c.SendString("READY")
	})

	api.Get("/version", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"version": "1.0.0"}) })

	// Identity Domain Routes
	identityGroup := api.Group("/identity")
	identityHandler.RegisterRoutes(identityGroup)

	// Archive routes
	archiveGroup := api.Group("/archive")
	archiveHandler.RegisterRoutes(archiveGroup)

	// AI routes
	aiGroup := api.Group("/ai")
	aiHandler.RegisterRoutes(aiGroup)
}
