"""LLM factory — returns a callable that accepts (system, user) → str.

Supports:
  - "anthropic"  → real Anthropic Messages API (requires ANTHROPIC_API_KEY)
  - "mock"       → deterministic offline responses, no API key needed
"""
from __future__ import annotations

import json
import structlog

log = structlog.get_logger(__name__)


def build_llm(provider: str, model: str, api_key: str, max_tokens: int, temperature: float):
    """Return a callable: (system: str, user: str) -> str."""
    if provider == "anthropic" and api_key:
        return _anthropic_llm(model, api_key, max_tokens, temperature)
    log.info("llm.mock", reason="no api_key or provider=mock", provider=provider)
    return _mock_llm()


def _anthropic_llm(model: str, api_key: str, max_tokens: int, temperature: float):
    import anthropic

    client = anthropic.Anthropic(api_key=api_key)

    def call(system: str, user: str) -> str:
        msg = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return msg.content[0].text

    return call


def _mock_llm():
    """Deterministic offline LLM for development / CI."""
    _counter = [0]

    def call(system: str, user: str) -> str:
        _counter[0] += 1
        # Extract agent type from system prompt keyword
        agent_type = "agent"
        for keyword in ("orchestrator", "critic", "coding", "research"):
            if keyword in system.lower():
                agent_type = keyword
                break

        # Return plausible-looking structured mock output
        mock_outputs = {
            "orchestrator": {
                "plan": [
                    "Step 1: Decompose the objective into atomic subtasks.",
                    "Step 2: Assign subtasks to appropriate specialist agents.",
                    "Step 3: Monitor progress and aggregate results.",
                ],
                "coordination_strategy": "parallel_with_critic_gate",
                "estimated_completion": "3-5 minutes",
                "confidence": 0.88,
            },
            "critic": {
                "critique": "The approach is logically sound. Minor improvements possible in error handling.",
                "score": 0.82,
                "issues": ["Missing edge case handling for empty input"],
                "suggestions": ["Add null checks", "Document assumptions"],
                "recommendation": "approve_with_minor_changes",
            },
            "coding": {
                "code": "# Generated implementation\ndef solve(input_data):\n    \"\"\"Implements the requested functionality.\"\"\"\n    return {\"result\": \"computed\", \"status\": \"success\"}",
                "language": "python",
                "tests": "def test_solve():\n    result = solve({})\n    assert result['status'] == 'success'",
                "explanation": "Implementation uses a straightforward approach with clear separation of concerns.",
            },
            "research": {
                "summary": "Research completed. Found 3 relevant sources with high confidence.",
                "findings": [
                    "Key finding 1: The topic has established best practices.",
                    "Key finding 2: Recent developments point to improved approaches.",
                    "Key finding 3: Trade-offs exist between performance and simplicity.",
                ],
                "sources": ["internal knowledge base", "best practices corpus"],
                "confidence": 0.79,
            },
        }
        return json.dumps(mock_outputs.get(agent_type, {"result": "task completed", "confidence": 0.75}))

    return call
