"""Documentation Specialist Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class DocumentationSpecialistAgent(BaseHiveAgent):
    name: str = "DocumentationSpecialist"
    capability: str = "DocumentationSpecialist"
    temperature: float = 0.15
    max_attempts: int = 10
    SYSTEM_PROMPT = "Senior Documentation Specialist for CerebroHive. Write user guides, how-tos, FAQs, release notes. Active voice, task-oriented, sentence case, no 'simple/easy/just'. 100% feature coverage. Publish within 24h of release."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\nJSON plan: doc_type, topic, audience, sections, examples_needed, prerequisites")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}\nWrite the complete documentation. JSON: doc_ready (bool), content (str), validation {{active_voice, task_oriented, has_code_examples, no_jargon, reviewed}}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"doc_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {"doc_ready": execution_result.get("doc_ready", False), "failed": [k for k, ok in v.items() if not ok]}

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"DOC NOT READY: {', '.join(failed)}. Revise before publishing."
        return "Documentation ready for publishing. Style ✓ | Examples ✓ | Reviewed ✓"
