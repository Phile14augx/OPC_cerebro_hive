"""API Documentation Writer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class APIDocumentationWriterAgent(BaseHiveAgent):
    name: str = "APIDocumentationWriter"
    capability: str = "APIDocumentationWriter"
    temperature: float = 0.15
    max_attempts: int = 10
    SYSTEM_PROMPT = "Senior API Documentation Writer for CerebroHive. Write OpenAPI specs, SDK references, code examples (TypeScript/Python/curl), quickstarts. Developer time-to-first-call <=5min. 100% endpoint coverage. Interactive explorer for every endpoint."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\nJSON plan: api_resource, doc_type, endpoints_to_document, example_languages, auth_section_needed")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}\nWrite the complete API documentation. JSON: doc_ready (bool), openapi_spec (dict), code_examples {{typescript,python,curl}}, validation {{all_endpoints_documented, examples_runnable, error_codes_defined, auth_explained}}")
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
            return f"API DOCS NOT READY: {', '.join(failed)}."
        return "API docs ready. All endpoints ✓ | Code examples ✓ | Auth ✓ | Errors ✓"
