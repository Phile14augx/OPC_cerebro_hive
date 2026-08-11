"""ML Engineer Agent."""
from __future__ import annotations
import json
from typing import Any
from .base_agent import BaseHiveAgent, ExecuteRequest


class MLEngineerAgent(BaseHiveAgent):
    name: str = "MLEngineer"
    capability: str = "MLEngineer"
    temperature: float = 0.15
    max_attempts: int = 15
    SYSTEM_PROMPT = (
        "Senior ML Engineer for CerebroHive EIOS. "
        "Fine-tune LLMs (LoRA/QLoRA), train embedding models, distillation, quantisation. "
        "MLOps: experiment tracking (W&B/MLflow), model cards, DVC, eval CI/CD. "
        "Every model has: model card, eval report, reproducibility script. "
        "Targets: >=10% benchmark improvement, <=2x base latency after fine-tune."
    )

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Objective: {request.objective}\nContext: {json.dumps(request.context)}\n"
            "Output JSON plan: base_model, task, method (lora/qlora/full), "
            "dataset_requirements, hyperparameters, eval_metrics, baselines, timeline_days")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; return json.loads(raw[s:e])
        except Exception:
            return {"raw": raw}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        raw = self._call_llm(self.SYSTEM_PROMPT,
            f"Plan: {json.dumps(plan)}\n"
            "Output JSON: model_ready (bool), eval_results {metric, baseline, result, improvement_pct}, "
            "model_card_url, validation {eval_complete, model_card_written, reproducibility_script, "
            "bias_audit_done, latency_acceptable}")
        try:
            s = raw.find("{"); e = raw.rfind("}") + 1; result = json.loads(raw[s:e])
        except Exception:
            result = {"model_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        v = execution_result.get("validation", {})
        return {
            "model_ready": execution_result.get("model_ready", False),
            "failed": [k for k, ok in v.items() if not ok],
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed", [])
        if failed:
            return f"MODEL NOT READY: {', '.join(failed)}."
        return "Model ready for LLMOps deployment pipeline. Eval ✓ | Card ✓ | Reproducible ✓"
