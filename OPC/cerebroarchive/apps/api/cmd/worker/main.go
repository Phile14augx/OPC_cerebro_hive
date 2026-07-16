package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/cerebro/cerebroarchive/apps/api/internal/archive"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/ai"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/broker"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/document"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/logger"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/storage"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/vector"
	"github.com/cerebro/cerebroarchive/apps/api/internal/worker"
)

func main() {
	// Initialize Structured Logger
	slogLogger := logger.NewLogger("debug")
	slogLogger.Info("booting cerebroarchive worker process...")

	// Initialize Dependencies
	blobStorage := storage.NewS3Storage("cerebro-documents-bucket")
	archiveRepo := archive.NewPostgresRepository(nil) // Assume pgxpool injected
	natsBroker := broker.NewNATSJetStreamBroker()
	
	// AI / Processing Pipeline Dependencies
	pdfParser := document.NewPDFParser()
	recursiveChunker := document.NewRecursiveChunker(1000, 200)
	openAIClient := platformai.NewOpenAIClient() // Embedder
	pineconeStore := vector.NewPineconeStore("cerebro-index")

	// Initialize Subsystems
	relay := worker.NewOutboxRelay(archiveRepo, natsBroker, slogLogger, 2*time.Second)
	processor := worker.NewDocumentProcessor(archiveRepo, blobStorage, pdfParser, recursiveChunker, openAIClient, pineconeStore, natsBroker, slogLogger)

	// Graceful Shutdown Context
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var wg sync.WaitGroup

	// Start Outbox Relay (Publisher)
	wg.Add(1)
	go func() {
		defer wg.Done()
		relay.Start(ctx)
	}()

	// Start Consumer
	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := processor.Start(ctx); err != nil {
			slogLogger.Error("failed to start document processor", "error", err)
			cancel() // Terminate if consumer fails
		}
	}()

	// Wait for OS Signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	
	slogLogger.Info("worker process is running")
	
	sig := <-quit
	slogLogger.Info("received shutdown signal, initiating graceful shutdown...", "signal", sig.String())
	
	// Trigger context cancellation to stop relay and consumers
	cancel()
	
	// Wait for in-flight operations to complete (or timeout)
	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		slogLogger.Info("graceful shutdown completed successfully")
	case <-time.After(10 * time.Second):
		slogLogger.Warn("graceful shutdown timed out, forcing exit")
	}
	
	// Close Broker Connection
	if err := natsBroker.Close(); err != nil {
		log.Printf("error closing broker: %v", err)
	}
}
