package api

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

const (
	writeWait  = 10 * time.Second
	pongWait   = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
	maxMsgSize = 512 * 1024 // 512 KiB
)

// WSMessage is the envelope sent over WebSocket.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}

// WSClient represents a single WebSocket subscriber.
type WSClient struct {
	hub  *WSHub
	conn *websocket.Conn
	send chan WSMessage
}

// WSHub manages a set of active WebSocket clients.
type WSHub struct {
	clients     map[*WSClient]bool
	broadcastCh chan WSMessage
	register    chan *WSClient
	unregister  chan *WSClient
}

func newWSHub() *WSHub {
	return &WSHub{
		clients:     make(map[*WSClient]bool),
		broadcastCh: make(chan WSMessage, 256),
		register:    make(chan *WSClient),
		unregister:  make(chan *WSClient),
	}
}

// broadcast sends a message to all connected clients.
func (h *WSHub) broadcast(msg WSMessage) {
	select {
	case h.broadcastCh <- msg:
	default:
		log.Warn().Msg("ws hub broadcast channel full, dropping message")
	}
}

func (h *WSHub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}

		case msg := <-h.broadcastCh:
			for client := range h.clients {
				select {
				case client.send <- msg:
				default:
					// Slow client — disconnect
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (c *WSClient) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMsgSize)
	_ = c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(pongWait))
	})
	for {
		// Drain reads to keep the connection alive; we don't expect client→server messages.
		if _, _, err := c.conn.ReadMessage(); err != nil {
			break
		}
	}
}

func (c *WSClient) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case msg, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			data, _ := json.Marshal(msg)
			if err := c.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}

		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
