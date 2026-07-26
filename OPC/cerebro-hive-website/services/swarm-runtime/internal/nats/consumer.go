// Package natscon provides a NATS JetStream consumer for swarm-runtime.
// It listens for swarm.run.created events and submits them to Temporal.
package natscon

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	natsio "github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
)

// RunCreatedPayload matches the envelope published by swarm-api.
type RunCreatedPayload struct {
	ID         string         `json:"id"`
	Type       string         `json:"type"`
	TenantID   string         `json:"tenantId"`
	OccurredAt string         `json:"occurredAt"`
	Payload    map[string]any `json:"payload"`
}

// RunHandler is called when a new run event is received.
type RunHandler func(ctx context.Context, payload RunCreatedPayload) error

// Consumer subscribes to swarm events from NATS JetStream.
type Consumer struct {
	nc           *natsio.Conn
	js           natsio.JetStreamContext
	handler      RunHandler
	consumerName string
}

// New creates and connects a Consumer.
func New(natsURL, consumerName string, handler RunHandler) (*Consumer, error) {
	nc, err := natsio.Connect(natsURL,
		natsio.MaxReconnects(-1),
		natsio.ReconnectWait(2*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("nats connect: %w", err)
	}
	js, err := nc.JetStream()
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("nats jetstream: %w", err)
	}
	return &Consumer{nc: nc, js: js, handler: handler, consumerName: consumerName}, nil
}

// Subscribe starts consuming swarm.run.created events. Blocks until ctx is done.
func (c *Consumer) Subscribe(ctx context.Context) error {
	sub, err := c.js.PullSubscribe(
		"swarm.run.created",
		c.consumerName,
		natsio.ManualAck(),
		natsio.AckWait(5*time.Minute),
		natsio.MaxDeliver(3),
	)
	if err != nil {
		return fmt.Errorf("pull subscribe: %w", err)
	}
	log.Info().Str("consumer", c.consumerName).Msg("swarm consumer started")

	for {
		select {
		case <-ctx.Done():
			_ = sub.Unsubscribe()
			return nil
		default:
		}

		msgs, err := sub.Fetch(10, natsio.Context(ctx))
		if err != nil {
			if ctx.Err() != nil {
				return nil
			}
			// Timeout is normal when queue is empty
			continue
		}

		for _, msg := range msgs {
			if err := c.process(ctx, msg); err != nil {
				log.Error().Err(err).Msg("failed to process swarm event")
				_ = msg.Nak()
			} else {
				_ = msg.Ack()
			}
		}
	}
}

func (c *Consumer) process(ctx context.Context, msg *natsio.Msg) error {
	var event RunCreatedPayload
	if err := json.Unmarshal(msg.Data, &event); err != nil {
		return fmt.Errorf("decode event: %w", err)
	}
	return c.handler(ctx, event)
}

// Close closes the NATS connection.
func (c *Consumer) Close() {
	if c.nc != nil {
		c.nc.Close()
	}
}
