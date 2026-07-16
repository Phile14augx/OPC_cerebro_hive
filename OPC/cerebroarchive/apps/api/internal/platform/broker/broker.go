package broker

import "context"

// Message represents a versioned event contract.
type Message struct {
	ID      string
	Subject string // e.g. "document.uploaded.v1"
	Data    []byte
}

// AckFunc acknowledges or negative-acknowledges a message.
// If nack is called with an error, the message will eventually be redelivered (based on exponential backoff).
type AckFunc func(err error)

// MessageHandler is the callback for processing an incoming message.
type MessageHandler func(ctx context.Context, msg Message, ack AckFunc)

// Publisher abstracts the event bus for publishing messages.
type Publisher interface {
	Publish(ctx context.Context, subject string, data []byte) error
}

// Subscriber abstracts the event bus for consuming messages.
type Subscriber interface {
	Subscribe(ctx context.Context, subject string, group string, handler MessageHandler) error
	Close() error
}

// NATSJetStreamBroker provides a stub implementation of Publisher and Subscriber.
type NATSJetStreamBroker struct {
	// nc *nats.Conn
	// js nats.JetStreamContext
}

func NewNATSJetStreamBroker() *NATSJetStreamBroker {
	return &NATSJetStreamBroker{}
}

func (b *NATSJetStreamBroker) Publish(ctx context.Context, subject string, data []byte) error {
	// return b.js.Publish(subject, data)
	return nil
}

func (b *NATSJetStreamBroker) Subscribe(ctx context.Context, subject string, group string, handler MessageHandler) error {
	// Mock subscription
	// b.js.QueueSubscribe(subject, group, func(m *nats.Msg) {
	//    handler(ctx, Message{ID: m.Header.Get("Msg-Id"), Subject: m.Subject, Data: m.Data}, func(err error) {
	//        if err != nil { m.Nak() } else { m.Ack() }
	//    })
	// })
	return nil
}

func (b *NATSJetStreamBroker) Close() error {
	return nil
}
