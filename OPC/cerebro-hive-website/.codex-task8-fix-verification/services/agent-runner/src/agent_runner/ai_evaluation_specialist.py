"""AI Evaluation Specialist Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest

class AIEvaluationSpecialistAgent(BaseHiveAgent):
    name: str = "AIEvaluationSpecialist"
    capability: str = "AIEvaluationSpecialist"
    temperature: float = 0.15
    max_attempts: int = 15
    SYSTEM_PROMPT = "Senior AI Evaluation Specialist for CerebroHive. Build eval datasets, run LLM-as-judge (calibrated), RAGAS evals, hallucination detection. Targets: <=2% hallucination rate, >=0.8 kappa human alignment, 100% AI features have eval suites."

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Objective: {request.objective}. JSON plan: ai_feature, eval_type, dataset_size, metrics, judge_model, human_eval_sample_pct, baselines")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT, f"Plan: {json.dumps(plan)}. JSON: eval_complete (bool), results {{faithfulness,relevance,groundedness,hallucination_rate,task_accuracy}}, human_kappa, passes_threshold (bool), recommendations [str]")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"eval_complete": False, "passes_threshold": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        results = execution_result.get("results", {})
        return {"eval_complete": execution_result.get("eval_complete", False), "passes_threshold": execution_result.get("passes_threshold", False), "hallucination_rate": results.get("hallucination_rate", 1.0), "human_kappa": execution_result.get("human_kappa", 0)}

    def reflect(self, observations: dict[str, Any]) -> str:
        if not observations.get("passes_threshold"):
            h = observations.get("hallucination_rate", 0)
            return f"AI EVAL FAILED: hallucination={h:.1%}. Do not deploy. Improve prompts or model."
        return f"AI eval passed. Hallucination: {observations.get('hallucination_rate',0):.1%}. Human kappa: {observations.get('human_kappa',0):.2f}. Deploy approved."
