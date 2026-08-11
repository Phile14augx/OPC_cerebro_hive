"""Request/response models for the learning service."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ── Replay ─────────────────────────────────────────────────────────────────────

class ReplayRecord(BaseModel):
    """Full execution trace of a single agent task — the ground truth for learning."""
    id: str = ""
    task_id: str
    run_id: str
    agent_id: str
    capability: str
    task_description: str
    plan_steps: list[str] = Field(default_factory=list)
    output_content: str
    quality_score: float = Field(..., ge=0.0, le=1.0)
    eval_criteria: dict[str, float] = Field(default_factory=dict)
    tool_calls: list[dict[str, Any]] = Field(default_factory=list)
    duration_ms: int = 0
    total_tokens: int = 0
    cost_usd: float = 0.0
    learnings: list[str] = Field(default_factory=list)
    anti_patterns: list[str] = Field(default_factory=list)
    created_at: str = ""


class StoreReplayResponse(BaseModel):
    id: str
    message: str = "stored"


# ── Benchmarks ─────────────────────────────────────────────────────────────────

class AgentBenchmark(BaseModel):
    """Aggregated performance statistics for a single agent."""
    agent_id: str
    capability: str
    window_size: int           # number of replays used
    avg_quality_score: float
    p50_quality: float
    p90_quality: float
    pass_rate: float           # fraction of tasks with score >= 0.6
    avg_duration_ms: float
    avg_cost_usd: float
    avg_tokens: float
    total_tasks: int
    computed_at: str


# ── Optimisation ───────────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    agent_id: str
    capability: str
    current_system_prompt: str
    # Optional: override the number of replays to sample
    sample_size: int = Field(default=20, ge=5, le=100)


class OptimizeResponse(BaseModel):
    agent_id: str
    capability: str
    optimized_prompt: str
    improvement_rationale: str
    expected_score_delta: float  # estimated score improvement (0–1)
    replays_used: int
    llm_tokens_used: int = 0
