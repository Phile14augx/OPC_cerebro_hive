"""Prompt Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest


class PromptEngineerAgent(BaseHiveAgent):
    name: str = "PromptEngineer"
    capability: str = "PromptEngineer"
    temperature: float = 0.2
    max_attempts: int = 12
    SYSTEM_PROMPT = (
        "Senior Prompt Engineer for CerebroHive EIOS. "
        "Design, version, evaluate, and optimise all prompts and system instructions. "
        "Prompts are code: versioned, tested, A/B tested, measured. "
        "Targets: >=15% accuracy improvement, <=2% hallucination rate, <=20% token reduction. "
        "Every production prompt has an eval suite. "
        "Use XML tagging, CoT, few-shot, structured output, and guardrail constraints."
    )

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\n"
            "Output JSON plan with: task, output_format, techniques, few_shot_examples, "
            "guardrails, eval_criteria, token_budget, version_tag")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Plan: {json.dumps(plan)}\n"
            "Output JSON: prompt_ready (bool), prompt_text (str), system_prompt (str), "
            "eval_suite [{input, expected_output}], validation {has_guardrails, has_output_schema, "
            "has_few_shots, has_eval_suite, version_tagged}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"prompt_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {
            "prompt_ready": execution_result.get("prompt_ready", False),
            "failed": [k for k, ok in v.items() if not ok],
            "eval_count": len(execution_result.get("eval_suite", [])),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"PROMPT NOT READY: {', '.join(failed)}. Fix before deploying."
        return (
            f"Prompt ready. Eval suite: {observations['eval_count']} examples. "
            "Guardrails ✓ | Output schema ✓ | Versioned ✓"
        )
