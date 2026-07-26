"""Replay and benchmark persistence using PostgreSQL (asyncpg)."""
from __future__ import annotations

import json
import statistics
import uuid
from datetime import datetime, timezone
from typing import Any

import asyncpg
import structlog

from .models import AgentBenchmark, ReplayRecord

log = structlog.get_logger(__name__)

PASS_THRESHOLD = 0.60


async def ensure_schema(conn: asyncpg.Connection) -> None:
    """Create the swarm_replays table if it doesn't exist (idempotent)."""
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS swarm_replays (
            id              TEXT PRIMARY KEY,
            task_id         TEXT NOT NULL,
            run_id          TEXT NOT NULL,
            agent_id        TEXT NOT NULL,
            capability      TEXT NOT NULL,
            task_description TEXT NOT NULL,
            plan_steps      JSONB,
            output_content  TEXT NOT NULL,
            quality_score   DOUBLE PRECISION NOT NULL,
            eval_criteria   JSONB,
            tool_calls      JSONB,
            duration_ms     BIGINT DEFAULT 0,
            total_tokens    BIGINT DEFAULT 0,
            cost_usd        DOUBLE PRECISION DEFAULT 0,
            learnings       JSONB,
            anti_patterns   JSONB,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE INDEX IF NOT EXISTS idx_replays_agent_cap
            ON swarm_replays(agent_id, capability);
        CREATE INDEX IF NOT EXISTS idx_replays_created
            ON swarm_replays(created_at DESC);
    """)


async def store_replay(pool: asyncpg.Pool, replay: ReplayRecord) -> str:
    """Insert a replay record and return its ID."""
    replay_id = replay.id or str(uuid.uuid4())
    created = replay.created_at or datetime.now(timezone.utc).isoformat()

    await pool.execute("""
        INSERT INTO swarm_replays (
            id, task_id, run_id, agent_id, capability, task_description,
            plan_steps, output_content, quality_score, eval_criteria,
            tool_calls, duration_ms, total_tokens, cost_usd,
            learnings, anti_patterns, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        ON CONFLICT (id) DO NOTHING
    """,
        replay_id, replay.task_id, replay.run_id, replay.agent_id,
        replay.capability, replay.task_description,
        json.dumps(replay.plan_steps), replay.output_content,
        replay.quality_score, json.dumps(replay.eval_criteria),
        json.dumps(replay.tool_calls), replay.duration_ms,
        replay.total_tokens, replay.cost_usd,
        json.dumps(replay.learnings), json.dumps(replay.anti_patterns),
        created,
    )
    return replay_id


async def get_replays(
    pool: asyncpg.Pool,
    agent_id: str,
    capability: str,
    limit: int = 100,
) -> list[dict[str, Any]]:
    """Fetch recent replays for a given agent+capability pair."""
    rows = await pool.fetch("""
        SELECT * FROM swarm_replays
        WHERE agent_id = $1 AND capability = $2
        ORDER BY created_at DESC
        LIMIT $3
    """, agent_id, capability, limit)
    return [dict(r) for r in rows]


async def compute_benchmark(
    pool: asyncpg.Pool,
    agent_id: str,
    capability: str,
    window: int = 100,
) -> AgentBenchmark | None:
    """Compute aggregated benchmarks from recent replays."""
    replays = await get_replays(pool, agent_id, capability, window)
    if not replays:
        return None

    scores = [float(r["quality_score"]) for r in replays]
    durations = [float(r["duration_ms"]) for r in replays]
    costs = [float(r["cost_usd"]) for r in replays]
    tokens = [float(r["total_tokens"]) for r in replays]

    sorted_scores = sorted(scores)
    n = len(sorted_scores)

    def percentile(data: list[float], p: float) -> float:
        idx = int(p / 100 * (len(data) - 1))
        return data[idx]

    return AgentBenchmark(
        agent_id=agent_id,
        capability=capability,
        window_size=n,
        avg_quality_score=round(statistics.mean(scores), 4),
        p50_quality=round(percentile(sorted_scores, 50), 4),
        p90_quality=round(percentile(sorted_scores, 90), 4),
        pass_rate=round(sum(1 for s in scores if s >= PASS_THRESHOLD) / n, 4),
        avg_duration_ms=round(statistics.mean(durations), 1),
        avg_cost_usd=round(statistics.mean(costs), 6),
        avg_tokens=round(statistics.mean(tokens), 1),
        total_tasks=n,
        computed_at=datetime.now(timezone.utc).isoformat(),
    )
