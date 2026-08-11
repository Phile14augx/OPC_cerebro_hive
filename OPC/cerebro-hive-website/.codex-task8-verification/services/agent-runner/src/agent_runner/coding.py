"""CodingAgent — writes, reviews, and fixes code with tests."""
from __future__ import annotations

import json
import re
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

_SYSTEM = """\
You are the Coding agent of HiveSwarm, an enterprise multi-agent operating system.

Your role:
- Write high-quality, production-ready code
- Include tests, docstrings, and error handling
- Follow language best practices and conventions
- Explain technical decisions clearly

Respond in valid JSON with this structure:
{
  "language": "python|typescript|go|rust|...",
  "code": "full implementation code here",
  "tests": "test code here",
  "explanation": "clear explanation of the implementation",
  "dependencies": ["dep1", "dep2"],
  "complexity": "O(n) time, O(1) space",
  "caveats": ["caveat 1"],
  "confidence": 0.0–1.0
}
"""


class CodingAgent(BaseHiveAgent):
    capability = "Coding"
    name = "HiveSwarm Coder"

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        # Parse language preference and scope from input
        language = req.input.get("language", "python")
        tech_spec = req.input.get("spec") or req.input.get("requirements") or req.objective

        return {
            "language": language,
            "tech_spec": tech_spec,
            "approach": "implement_with_tests",
            "steps": [
                f"Understand the {language} implementation requirements",
                "Design the core data structures and interfaces",
                "Implement the primary logic",
                "Add error handling and edge cases",
                "Write unit tests",
                "Add documentation",
            ],
        }

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        language = plan.get("language", "python")
        spec = plan.get("tech_spec", req.objective)

        prompt = f"""Programming task: {req.objective}

Language: {language}
Specification: {spec}

Additional context: {json.dumps({k: v for k, v in req.input.items() if k not in ('objective', 'name')}, indent=2)}

Write a complete, production-ready implementation with tests."""

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            # Try to extract code from markdown blocks
            code = _extract_code_block(raw) or raw
            result = {
                "language": language,
                "code": code,
                "tests": "",
                "explanation": "Implementation extracted from LLM response.",
                "dependencies": [],
                "complexity": "unknown",
                "caveats": [],
                "confidence": 0.7,
            }
        return result

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        has_code = bool(result.get("code", "").strip())
        has_tests = bool(result.get("tests", "").strip())
        code_len = len(result.get("code", ""))
        quality = 0.0
        if has_code:
            quality += 0.5
        if has_tests:
            quality += 0.2
        if result.get("explanation"):
            quality += 0.15
        if code_len > 100:
            quality += 0.15
        quality = min(1.0, quality)
        return {
            "hasOutput": has_code,
            "hasCode": has_code,
            "hasTests": has_tests,
            "codeLength": code_len,
            "qualityScore": quality,
            "notes": f"{code_len} chars of {result.get('language', '?')} code, tests={'yes' if has_tests else 'no'}.",
        }

    def reflect(self, req: ExecuteRequest, result: dict[str, Any], observation: dict[str, Any]) -> dict[str, Any]:
        return {
            "objectiveClarity": "clear" if observation.get("hasCode") else "unclear",
            "executionStrategy": "llm_code_generation",
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": [
                "Run generated code in a sandboxed environment before deployment",
                "Request the Critic agent to review for security issues",
            ],
        }


def _extract_code_block(text: str) -> str | None:
    """Extract first code block from markdown-formatted text."""
    match = re.search(r"```(?:\w+)?\n(.*?)```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return None
