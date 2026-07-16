package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/cerebro/cerebroarchive/apps/api/internal/identity"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/config"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/logger"
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

	// In a real scenario we parse connection URL from cfg.DatabaseURL
	// Using a dummy pool initialization here for scaffolding purposes
	var pool *pgxpool.Pool
	// pool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	// if err != nil { log.Error("Failed to connect to DB", "err", err); os.Exit(1) }

	app := &App{
		Config: cfg,
		Logger: log,
		DB:     pool,
		Fiber:  fiber.New(fiber.Config{DisableStartupMessage: true}),
	}

	bootstrap(app)

	log.Info("Listening", "port", cfg.HTTPPort)
	if err := app.Fiber.Listen(":" + cfg.HTTPPort); err != nil {
		log.Error("Server failed", "err", err)
		os.Exit(1)
	}
}

func bootstrap(app *App) {
	// Initialize Repositories (will inject SQLC Queries instance here)
	identityRepo := identity.NewRepository(app.DB)

	// Initialize Services
	app.IdentityService = identity.NewService(identityRepo, app.Logger)

	// Initialize Handlers
	identityHandler := identity.NewHandler(app.IdentityService)

	// Mount Routes
	api := app.Fiber.Group("/api/v1")

	// Health check endpoints (Kubernetes friendly)
	health := api.Group("/health")
	health.Get("/live", func(c *fiber.Ctx) error { return c.SendString("OK") })
	health.Get("/ready", func(c *fiber.Ctx) error { 
		// DB check logic goes here
		return c.SendString("READY") 
	})

	api.Get("/version", func(c *fiber.Ctx) error { return c.JSON(fiber.Map{"version": "1.0.0"}) })

	// Identity Domain Routes
	identityGroup := api.Group("/identity")
	identityHandler.RegisterRoutes(identityGroup)
}
