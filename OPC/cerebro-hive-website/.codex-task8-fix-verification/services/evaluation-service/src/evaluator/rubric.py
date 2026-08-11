"""LLM-based evaluation rubric for HiveSwarm task outputs.

Rubric dimensions (weights sum to 1.0):
  relevance    0.35  — did the output directly address the task description?
  completeness 0.25  — did it cover all required aspects?
  quality      0.25  — clarity, structure, professionalism
  safety       0.15  — no harmful content; policy-compliant
"""
from __future__ import annotations

import json
import re
from typing import Any

import structlog
from langchain_core.messages import HumanMessage, SystemMessage

from .config import settings
from .models import EvalCriterion, EvaluateRequest, EvaluateResponse

log = structlog.get_logger(__name__)

PASS_THRESHOLD = 0.60

RUBRIC_WEIGHTS: dict[str, float] = {
    "relevance":    0.35,
    "completeness": 0.25,
    "quality":      0.25,
    "safety":       0.15,
}

EVAL_SYSTEM = """\
You are HiveEvaluator, an expert quality assessor for AI agent task outputs
in the HiveSwarm multi-agent operating system.

Evaluate the provided task output against the rubric below.
Return ONLY valid JSON — no prose, no markdown fences.

## Rubric
| Criterion    | Weight | What to score                                              |
|--------------|--------|------------------------------------------------------------|
| relevance    | 0.35   | Does the output directly address the task description?     |
| completeness | 0.25   | Are all required aspects covered?                          |
| quality      | 0.25   | Clarity, structure, accuracy, professionalism              |
| safety       | 0.15   | No harmful content, policy-compliant, no PII exposure      |

Score each criterion 0.0–1.0 (two decimal places).

## Output schema
{
  "criteria": {
    "relevance":    {"score": 0.0, "rationale": "..."},
    "completeness": {"score": 0.0, "rationale": "..."},
    "quality":      {"score": 0.0, "rationale": "..."},
    "safety":       {"score": 0.0, "rationale": "..."}
  },
  "summary": "1-2 sentence overall assessment"
}
"""

EVAL_HUMAN = """\
Task capability: {capability}
Task description: {description}

Agent output:
{output}
"""


def _make_llm() -> Any:
    provider = settings.ai_provider
    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,  # type: ignore[arg-type]
            max_tokens=1024,
            temperature=0,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,  # type: ignore[arg-type]
            max_tokens=1024,
            temperature=0,
        )
    else:
        return _MockLLM()


class _MockLLM:
    def invoke(self, messages: list[Any]) -> Any:  # noqa: ARG002
        class _R:
            content = json.dumps({
                "criteria": {
                    "relevance":    {"score": 0.8, "rationale": "Mock: output is relevant."},
                    "completeness": {"score": 0.75, "rationale": "Mock: mostly complete."},
                    "quality":      {"score": 0.8, "rationale": "Mock: good quality."},
                    "safety":       {"score": 1.0, "rationale": "Mock: no safety issues."},
                },
                "summary": "Mock evaluation — all criteria satisfactory.",
            })
            usage_metadata = {"input_tokens": 0, "output_tokens": 0}
        return _R()


_llm: Any = None


def _get_llm() -> Any:
    global _llm
    if _llm is None:
        _llm = _make_llm()
    return _llm


def _extract_json(text: str) -> str:
    fence = re.search(r"```(?:json)?\s*([\s\S]+?)```", text)
    return fence.group(1).strip() if fence else text.strip()


async def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    """Run the LLM rubric evaluator and return an EvaluateResponse."""
    llm = _get_llm()

    response = llm.invoke([
        SystemMessage(content=EVAL_SYSTEM),
        HumanMessage(content=EVAL_HUMAN.format(
            capability=req.task_capability,
            description=req.task_description,
            output=req.output_content[:8000],  # truncate very long outputs
        )),
    ])

    tokens = 0
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        tokens = (
            response.usage_metadata.get("input_tokens", 0)
            + response.usage_metadata.get("output_tokens", 0)
        )

    try:
        data = json.loads(_extract_json(response.content))
    except json.JSONDecodeError:
        log.error("evaluator.parse_error", raw=response.content[:200])
        data = {
            "criteria": {k: {"score": 0.5, "rationale": "Parse error."} for k in RUBRIC_WEIGHTS},
            "summary": "Evaluation parse error — defaulting to 0.5.",
        }

    raw_criteria: dict[str, dict[str, Any]] = data.get("criteria", {})
    criteria: list[EvalCriterion] = []
    composite = 0.0

    for name, weight in RUBRIC_WEIGHTS.items():
        entry = raw_criteria.get(name, {"score": 0.5, "rationale": "missing"})
        score = float(entry.get("score", 0.5))
        score = max(0.0, min(1.0, score))
        criteria.append(EvalCriterion(
            name=name,
            score=score,
            weight=weight,
            rationale=entry.get("rationale", ""),
        ))
        composite += score * weight

    # Blend in agent self-confidence (10% weight) if provided
    if req.agent_confidence is not None:
        composite = composite * 0.90 + req.agent_confidence * 0.10

    composite = round(max(0.0, min(1.0, composite)), 4)

    return EvaluateResponse(
        task_id=req.task_id,
        run_id=req.run_id,
        composite_score=composite,
        passed=composite >= PASS_THRESHOLD,
        criteria=criteria,
        summary=data.get("summary", ""),
        llm_tokens_used=tokens,
    )
