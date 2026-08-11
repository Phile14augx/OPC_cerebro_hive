// Package ratelimit provides per-tool, per-agent rate limiting using Redis.
//
// Uses a sliding window counter stored in Redis with a 60-second TTL.
// Key format: ratelimit:<toolId>:<agentId>
package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Limiter enforces per-tool rate limits backed by Redis.
type Limiter struct {
	rdb *redis.Client
}

// New creates a Limiter.
func New(rdb *redis.Client) *Limiter {
	return &Limiter{rdb: rdb}
}

// Allow returns (true, remaining) if the agent may call the tool right now,
// or (false, 0) if the rate limit is exceeded.
func (l *Limiter) Allow(ctx context.Context, toolID, agentID string, maxPerMinute int) (bool, int, error) {
	key := fmt.Sprintf("ratelimit:%s:%s", toolID, agentID)
	now := time.Now()
	windowStart := now.Add(-60 * time.Second).UnixMilli()

	pipe := l.rdb.Pipeline()
	pipe.ZRemRangeByScore(ctx, key, "0", fmt.Sprint(windowStart))
	pipe.ZAdd(ctx, key, redis.Z{Score: float64(now.UnixMilli()), Member: now.UnixNano()})
	pipe.ZCard(ctx, key)
	pipe.Expire(ctx, key, 70*time.Second)

	results, err := pipe.Exec(ctx)
	if err != nil {
		return false, 0, fmt.Errorf("redis pipeline: %w", err)
	}

	count := int(results[2].(*redis.IntCmd).Val())
	remaining := maxPerMinute - count
	if remaining < 0 {
		remaining = 0
	}
	return count <= maxPerMinute, remaining, nil
}
