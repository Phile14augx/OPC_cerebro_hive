package worker

import (
	"context"
	"log/slog"
	"time"

	"github.com/cerebro/cerebroarchive/apps/api/internal/archive"
	"github.com/cerebro/cerebroarchive/apps/api/internal/platform/broker"
)

// OutboxRelay continuously polls the database for outbox events and pushes them to the Broker.
type OutboxRelay struct {
	repo     archive.Repository
	pub      broker.Publisher
	logger   *slog.Logger
	interval time.Duration
}

func NewOutboxRelay(repo archive.Repository, pub broker.Publisher, logger *slog.Logger, interval time.Duration) *OutboxRelay {
	return &OutboxRelay{
		repo:     repo,
		pub:      pub,
		logger:   logger,
		interval: interval,
	}
}

// Start runs the polling loop until the context is canceled.
func (r *OutboxRelay) Start(ctx context.Context) {
	r.logger.Info("starting outbox relay", "interval", r.interval)
	ticker := time.NewTicker(r.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			r.logger.Info("shutting down outbox relay")
			return
		case <-ticker.C:
			r.processOutbox(ctx)
		}
	}
}

func (r *OutboxRelay) processOutbox(ctx context.Context) {
	// 1. tx, err := r.repo.Begin(ctx)
	// 2. events := r.repo.GetPendingEventsLimit(ctx, 100) (SELECT ... FOR UPDATE SKIP LOCKED)
	// 3. For each event:
	//      err := r.pub.Publish(ctx, event.EventType, event.Payload)
	//      if err == nil { r.repo.MarkEventProcessed(ctx, event.ID) }
	// 4. tx.Commit()
	
	// Stub implementation to simulate work
	_ = r.repo
}
