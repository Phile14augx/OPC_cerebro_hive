"""Request/response models for the evaluation service."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class EvalCriterion(BaseModel):
    name: str
    score: float = Field(..., ge=0.0, le=1.0)
    weight: float = Field(..., ge=0.0, le=1.0)
    rationale: str


class EvaluateRequest(BaseModel):
    task_id: str
    run_id: str
    task_description: str = Field(..., min_length=5, max_length=4000)
    task_capability: str
    output_content: str = Field(..., min_length=1, max_length=32_000)
    output_metadata: dict[str, Any] = Field(default_factory=dict)
    # Optional: pass the agent's own self-reported confidence to adjust score
    agent_confidence: float | None = Field(None, ge=0.0, le=1.0)


class EvaluateResponse(BaseModel):
    task_id: str
    run_id: str
    composite_score: float = Field(..., ge=0.0, le=1.0)
    passed: bool                    # score >= pass_threshold (0.6)
    criteria: list[EvalCriterion]
    summary: str
    llm_tokens_used: int = 0
