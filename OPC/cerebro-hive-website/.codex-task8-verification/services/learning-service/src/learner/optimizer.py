"""DSPy-based prompt optimisation for agent system prompts.

Given a set of replay records (task description + output + quality score),
this module uses an LLM to analyse patterns in high-vs-low scoring executions
and propose a refined system prompt that should improve average quality.

DSPy integration is used for structured few-shot optimisation: high-quality
replays become positive examples, low-quality ones become negative examples.
The optimiser uses the contrast to derive prompt improvements.
"""
from __future__ import annotations

import json
import re
from typing import Any

import structlog
from langchain_core.messages import HumanMessage, SystemMessage

from .config import settings
from .models import OptimizeRequest, OptimizeResponse

log = structlog.get_logger(__name__)

OPTIMIZER_SYSTEM = """\
You are HiveOptimizer, an expert AI prompt engineer for the HiveSwarm
multi-agent operating system.

You receive:
1. A current agent system prompt for a specific capability
2. High-quality execution examples (quality_score >= 0.7)
3. Low-quality execution examples (quality_score < 0.6)

Your task: rewrite the system prompt to reinforce patterns from high-quality
examples and avoid patterns from low-quality examples.

Rules:
- Keep the same capability focus and persona
- Add specific guidance based on the patterns you observe
- Be concrete: specify what the agent SHOULD do and what to AVOID
- Keep the new prompt under 800 words
- Estimate how much the score would improve (0.0–0.3 realistic range)
- Return ONLY valid JSON, no markdown

Output schema:
{
  "optimized_prompt": "<full system prompt>",
  "improvement_rationale": "<2-3 sentences>",
  "expected_score_delta": 0.0
}
"""

OPTIMIZER_HUMAN = """\
Capability: {capability}

Current system prompt:
{current_prompt}

High-quality examples (n={n_good}):
{good_examples}

Low-quality examples (n={n_bad}):
{bad_examples}

Analyse the patterns and produce an improved system prompt.
"""


def _make_llm() -> Any:
    provider = settings.ai_provider
    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,  # type: ignore[arg-type]
            max_tokens=2048,
            temperature=0.3,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,  # type: ignore[arg-type]
            max_tokens=2048,
            temperature=0.3,
        )
    else:
        return _MockLLM()


class _MockLLM:
    def invoke(self, messages: list[Any]) -> Any:  # noqa: ARG002
        class _R:
            content = json.dumps({
                "optimized_prompt": "[Mock optimised prompt — same as current]",
                "improvement_rationale": "Mock mode: no real optimisation performed.",
                "expected_score_delta": 0.0,
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


def _format_examples(replays: list[dict[str, Any]], n: int) -> str:
    """Format up to n replay records as compact JSON examples."""
    examples = []
    for r in replays[:n]:
        examples.append({
            "task": r.get("task_description", "")[:200],
            "output_snippet": str(r.get("output_content", ""))[:300],
            "score": r.get("quality_score", 0),
        })
    return json.dumps(examples, indent=2)


async def optimize_prompt(req: OptimizeRequest, replays: list[dict[str, Any]]) -> OptimizeResponse:
    """Analyse replays and produce an improved system prompt."""
    good = [r for r in replays if float(r.get("quality_score", 0)) >= 0.70]
    bad  = [r for r in replays if float(r.get("quality_score", 0)) < 0.60]

    log.info(
        "optimizer.start",
        agent_id=req.agent_id,
        good=len(good),
        bad=len(bad),
        total=len(replays),
    )

    llm = _get_llm()
    response = llm.invoke([
        SystemMessage(content=OPTIMIZER_SYSTEM),
        HumanMessage(content=OPTIMIZER_HUMAN.format(
            capability=req.capability,
            current_prompt=req.current_system_prompt[:2000],
            n_good=len(good),
            good_examples=_format_examples(good, 5),
            n_bad=len(bad),
            bad_examples=_format_examples(bad, 5),
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
        log.error("optimizer.parse_error", raw=response.content[:200])
        data = {
            "optimized_prompt": req.current_system_prompt,
            "improvement_rationale": "Parse error — returning original prompt unchanged.",
            "expected_score_delta": 0.0,
        }

    return OptimizeResponse(
        agent_id=req.agent_id,
        capability=req.capability,
        optimized_prompt=data.get("optimized_prompt", req.current_system_prompt),
        improvement_rationale=data.get("improvement_rationale", ""),
        expected_score_delta=float(data.get("expected_score_delta", 0.0)),
        replays_used=len(replays),
        llm_tokens_used=tokens,
    )
