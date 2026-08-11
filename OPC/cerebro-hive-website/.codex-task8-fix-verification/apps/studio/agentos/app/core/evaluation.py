"""Evaluation Platform: score a completed run on latency, cost, and a handful
of quality heuristics. Groundedness/hallucination/citation scoring here are
intentionally simple heuristics (keyword/citation-presence checks) — a
production system would run an LLM-as-judge pass or a trained classifier;
the scoring contract (metric name -> float) is what the rest of the platform
depends on, so that swap doesn't touch call sites.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class EvaluationResult:
    latency_ms: float
    cost_usd: float
    groundedness: float
    citation_count: int
    reasoning_quality: float


def evaluate_run(result_text: str, trace_durations_ms: list[float], cost_usd: float, citations: str = "") -> EvaluationResult:
    latency_ms = sum(trace_durations_ms)
    citation_count = citations.count("[")
    groundedness = min(1.0, 0.5 + 0.1 * citation_count)  # naive heuristic
    reasoning_quality = min(1.0, len(result_text.split()) / 200)  # naive heuristic

    return EvaluationResult(
        latency_ms=latency_ms,
        cost_usd=cost_usd,
        groundedness=round(groundedness, 2),
        citation_count=citation_count,
        reasoning_quality=round(reasoning_quality, 2),
    )
