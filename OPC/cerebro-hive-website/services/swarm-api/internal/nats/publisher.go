// Package natspub provides NATS JetStream integration for swarm-api.
package natspub

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	natsio "github.com/nats-io/nats.go"
	"github.com/rs/zerolog/log"
)

// SwarmPublisher publishes swarm domain events to NATS JetStream.
type SwarmPublisher struct {
	nc *natsio.Conn
	js natsio.JetStreamContext
}

// NewSwarmPublisher creates a connected SwarmPublisher.
func NewSwarmPublisher(natsURL string) (*SwarmPublisher, error) {
	nc, err := natsio.Connect(natsURL,
		natsio.MaxReconnects(-1),
		natsio.ReconnectWait(2*time.Second),
		natsio.DisconnectErrHandler(func(_ *natsio.Conn, err error) {
			log.Error().Err(err).Msg("NATS disconnected")
		}),
		natsio.ReconnectHandler(func(_ *natsio.Conn) {
			log.Info().Msg("NATS reconnected")
		}),
	)
	if err != nil {
		return nil, fmt.Errorf("nats connect: %w", err)
	}

	js, err := nc.JetStream()
	if err != nil {
		nc.Close()
		return nil, fmt.Errorf("nats jetstream: %w", err)
	}

	// Ensure the SWARM stream exists
	if err := ensureStream(js); err != nil {
		nc.Close()
		return nil, err
	}

	return &SwarmPublisher{nc: nc, js: js}, nil
}

// Publish sends a typed event payload to the given NATS subject.
func (p *SwarmPublisher) Publish(_ context.Context, subject string, payload any) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal event: %w", err)
	}
	_, err = p.js.Publish(subject, data)
	return err
}

// PublishEvent wraps an arbitrary payload in a standard envelope and publishes it.
func (p *SwarmPublisher) PublishEvent(_ context.Context, eventType, subject, tenantID string, payload any) error {
	envelope := map[string]any{
		"id":         uuid.New().String(),
		"type":       eventType,
		"tenantId":   tenantID,
		"occurredAt": time.Now().UTC().Format(time.RFC3339Nano),
		"payload":    payload,
	}
	data, err := json.Marshal(envelope)
	if err != nil {
		return fmt.Errorf("marshal event envelope: %w", err)
	}
	_, err = p.js.Publish(subject, data)
	return err
}

// Close closes the NATS connection.
func (p *SwarmPublisher) Close() {
	if p.nc != nil {
		p.nc.Close()
	}
}

func ensureStream(js natsio.JetStreamContext) error {
	_, err := js.StreamInfo("SWARM")
	if err == natsio.ErrStreamNotFound {
		_, err = js.AddStream(&natsio.StreamConfig{
			Name:       "SWARM",
			Subjects:   []string{"swarm.>"},
			MaxAge:     7 * 24 * time.Hour,
			Storage:    natsio.FileStorage,
			Replicas:   1,
			MaxMsgSize: 4 * 1024 * 1024, // 4 MiB
		})
		return err
	}
	return err
}
