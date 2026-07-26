// Package domain defines the core domain models for the swarm-api service.
package domain

import "time"

// AgentStatus represents the lifecycle state of a registered agent.
type AgentStatus string

const (
	AgentStatusActive     AgentStatus = "active"
	AgentStatusIdle       AgentStatus = "idle"
	AgentStatusDraining   AgentStatus = "draining"   // finishing current tasks, no new ones
	AgentStatusOffline    AgentStatus = "offline"
	AgentStatusDeprecated AgentStatus = "deprecated"
)

// AgentHealth represents a health check result.
type AgentHealth string

const (
	HealthHealthy   AgentHealth = "healthy"
	HealthDegraded  AgentHealth = "degraded"
	HealthUnhealthy AgentHealth = "unhealthy"
	HealthUnknown   AgentHealth = "unknown"
)

// Agent is the registry entry for a HiveSwarm agent.
type Agent struct {
	ID           string            `json:"id"`
	Name         string            `json:"name"`
	Version      string            `json:"version"`
	Owner        string            `json:"owner"`
	Capabilities []string          `json:"capabilities"`
	Tags         []string          `json:"tags"`
	Concurrency  int               `json:"concurrency"`
	Status       AgentStatus       `json:"status"`
	Health       AgentHealth       `json:"health"`
	ActiveRuns   int               `json:"activeRuns"`
	LoadFactor   float64           `json:"loadFactor"`
	Endpoint     string            `json:"endpoint"`     // gRPC or HTTP endpoint of the agent process
	Metadata     map[string]string `json:"metadata"`
	RegisteredAt time.Time         `json:"registeredAt"`
	LastSeenAt   time.Time         `json:"lastSeenAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
}

// AgentRegistration is the payload for registering a new agent.
type AgentRegistration struct {
	Name         string            `json:"name"         binding:"required"`
	Version      string            `json:"version"      binding:"required"`
	Owner        string            `json:"owner"        binding:"required"`
	Capabilities []string          `json:"capabilities" binding:"required,min=1"`
	Tags         []string          `json:"tags"`
	Concurrency  int               `json:"concurrency"  binding:"required,min=1,max=100"`
	Endpoint     string            `json:"endpoint"     binding:"required"`
	Metadata     map[string]string `json:"metadata"`
}

// AgentFilter is used to query the agent registry.
type AgentFilter struct {
	Capability string
	Status     AgentStatus
	MinHealth  AgentHealth
	Tags       []string
	Limit      int
	Offset     int
}
