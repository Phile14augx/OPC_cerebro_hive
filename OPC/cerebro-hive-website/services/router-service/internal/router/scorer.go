// Package router implements agent selection scoring for HiveSwarm.
//
// Composite score (higher = better):
//
//	score = proficiency × 0.40
//	      - loadPenalty × 0.30   (0 when idle, 1 when fully loaded)
//	      - costPenalty × 0.20   (normalised to [0,1] within candidate set)
//	      - latencyPenalty × 0.10
//
// Agents exceeding the cost ceiling or latency SLO are excluded entirely.
package router

import (
	"context"
	"fmt"
	"math"
	"sort"

	"github.com/cerebro/router-service/internal/registry"
)

const (
	weightProficiency float64 = 0.40
	weightLoad        float64 = 0.30
	weightCost        float64 = 0.20
	weightLatency     float64 = 0.10
)

// RouteRequest specifies the routing criteria.
type RouteRequest struct {
	Capability      string  `json:"capability"`
	MinProficiency  float64 `json:"minProficiency"`  // 0–1, default 0
	MaxCostUSD      float64 `json:"maxCostUsd"`      // 0 = unlimited
	MaxLatencyMs    float64 `json:"maxLatencyMs"`    // 0 = unlimited
	PreferAgentID   string  `json:"preferAgentId"`   // optional affinity
}

// RouteResult is the selected agent plus scoring metadata.
type RouteResult struct {
	AgentID   string  `json:"agentId"`
	Endpoint  string  `json:"endpoint"`
	Score     float64 `json:"score"`
	Reason    string  `json:"reason"`
}

// candidate is an internal scoring record during agent selection.
type candidate struct {
	agent registry.AgentRecord
	score float64
}

// Reader is the subset of registry.Reader used by the router.
type Reader interface {
	GetAgentsForCapability(ctx context.Context, cap string) ([]registry.AgentRecord, error)
}

// Select finds the best agent for the given RouteRequest.
func Select(ctx context.Context, reg Reader, req RouteRequest) (*RouteResult, error) {
	agents, err := reg.GetAgentsForCapability(ctx, req.Capability)
	if err != nil {
		return nil, fmt.Errorf("registry lookup: %w", err)
	}

	// ── Filter candidates ──────────────────────────────────────────────────────
	var candidates []registry.AgentRecord
	for _, a := range agents {
		if a.Status != "idle" && a.Status != "busy" {
			continue
		}
		if req.MinProficiency > 0 && capProficiency(a, req.Capability) < req.MinProficiency {
			continue
		}
		if req.MaxCostUSD > 0 && a.AvgCostPerTask > req.MaxCostUSD {
			continue
		}
		if req.MaxLatencyMs > 0 && a.AvgLatencyMs > req.MaxLatencyMs {
			continue
		}
		candidates = append(candidates, a)
	}

	if len(candidates) == 0 {
		return nil, fmt.Errorf("no eligible agents for capability %q with current constraints", req.Capability)
	}

	// ── Normalise cost and latency across candidate set ───────────────────────
	maxCost := maxFloat(candidates, func(a registry.AgentRecord) float64 { return a.AvgCostPerTask })
	maxLat := maxFloat(candidates, func(a registry.AgentRecord) float64 { return a.AvgLatencyMs })

	// ── Score each candidate ──────────────────────────────────────────────────
	ranked := make([]candidate, 0, len(candidates))
	for _, a := range candidates {
		prof := capProficiency(a, req.Capability)
		load := a.CurrentLoad // already 0–1
		costNorm := normalisedPenalty(a.AvgCostPerTask, maxCost)
		latNorm := normalisedPenalty(a.AvgLatencyMs, maxLat)

		s := prof*weightProficiency -
			load*weightLoad -
			costNorm*weightCost -
			latNorm*weightLatency

		ranked = append(ranked, candidate{agent: a, score: s})
	}

	// Preferred agent gets a small affinity bonus (tie-break)
	if req.PreferAgentID != "" {
		for i := range ranked {
			if ranked[i].agent.ID == req.PreferAgentID {
				ranked[i].score += 0.05
			}
		}
	}

	sort.Slice(ranked, func(i, j int) bool { return ranked[i].score > ranked[j].score })
	best := ranked[0]

	return &RouteResult{
		AgentID:  best.agent.ID,
		Endpoint: best.agent.Endpoint,
		Score:    math.Round(best.score*1000) / 1000,
		Reason:   fmt.Sprintf("proficiency=%.2f load=%.2f costUSD=%.4f latencyMs=%.0f", capProficiency(best.agent, req.Capability), best.agent.CurrentLoad, best.agent.AvgCostPerTask, best.agent.AvgLatencyMs),
	}, nil
}

// ── Helpers ────────────────────────────────────────────────────────────────────

func capProficiency(a registry.AgentRecord, cap string) float64 {
	for _, c := range a.Capabilities {
		if c.Capability == cap {
			return c.Proficiency
		}
	}
	return 0
}

func normalisedPenalty(value, max float64) float64 {
	if max == 0 {
		return 0
	}
	return value / max
}

func maxFloat(agents []registry.AgentRecord, fn func(registry.AgentRecord) float64) float64 {
	m := 0.0
	for _, a := range agents {
		if v := fn(a); v > m {
			m = v
		}
	}
	return m
}
