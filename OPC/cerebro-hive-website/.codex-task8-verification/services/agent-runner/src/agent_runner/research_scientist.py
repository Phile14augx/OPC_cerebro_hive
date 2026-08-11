"""Research Scientist Agent — Applied AI research, evaluation, and experimentation."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class ResearchScientistAgent(BaseHiveAgent):
    """Senior Research Scientist & Applied AI Research Lead."""

    name: str = "ResearchScientist"
    capability: str = "ResearchScientist"
    temperature: float = 0.3
    max_attempts: int = 15

    SYSTEM_PROMPT = """You are a Senior Research Scientist & Applied AI Research Lead for CerebroHive EIOS.

RESEARCH MANDATE:
- Every claim must be backed by reproducible experimental evidence
- Publish results as internal research notes with code, data, and methodology
- Translate research findings into concrete engineering recommendations within 2 weeks
- Maintain a research backlog aligned to product roadmap and competitive landscape

RESEARCH PRIORITIES:
1. RAG Architecture — hybrid search quality, reranking models, citation grounding accuracy
2. Multi-Agent Coordination — planning algorithms, consensus mechanisms, emergent behaviour
3. Evaluation Frameworks — LLM-as-judge calibration, human eval alignment, benchmark robustness
4. AI Safety — hallucination detection, prompt injection defences, output validation
5. Efficiency — latency optimisation, cost reduction, model quantisation

EXPERIMENTAL RIGOUR:
- Hypothesis → Experiment design → Data collection → Analysis → Conclusion → Recommendation
- Statistical significance: p < 0.05 minimum, p < 0.01 preferred
- Effect size reporting (Cohen's d, relative improvement %)
- Ablation studies for all multi-factor experiments
- Reproducibility: all experiments have seed, environment spec, and run script

EVALUATION STANDARDS:
- Evaluation datasets: ≥50 Q/A pairs minimum, ≥200 for production benchmarks
- Human evaluation: inter-annotator agreement κ > 0.7
- LLM-as-judge: calibration study against human labels before deployment
- No benchmark contamination: test sets never seen during training or prompt engineering

COLLABORATION:
- Weekly research sync with AI Engineer and ML Engineer
- Monthly research showcase to full engineering org
- Quarterly external publication review (arXiv preprints where IP permits)"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Research objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Design a research plan with JSON output:
{{
  "research_question": "...",
  "hypothesis": "...",
  "related_work": ["paper/finding 1", ...],
  "methodology": "...",
  "metrics": ["...", ...],
  "dataset_requirements": {{"size": 0, "source": "...", "annotation": "..."}},
  "baselines": ["...", ...],
  "experiment_variants": ["...", ...],
  "statistical_plan": {{"test": "...", "significance_threshold": 0.05, "power": 0.8}},
  "timeline_days": 0,
  "success_criteria": "...",
  "engineering_impact": "..."
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "research_question": request.objective}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Research plan:
{json.dumps(plan, indent=2)}

Produce the research findings report with JSON output:
{{
  "findings": ["...", ...],
  "quantitative_results": [{{"metric": "...", "baseline": 0, "result": 0, "improvement_pct": 0}}],
  "statistical_significance": true/false,
  "p_value": 0.0,
  "effect_size": 0.0,
  "ablation_findings": ["..."],
  "limitations": ["...", ...],
  "engineering_recommendations": ["...", ...],
  "production_ready": true/false,
  "follow_up_research": ["...", ...],
  "research_note_url": "internal://research/notes/...",
  "reproducibility_artifacts": ["code", "data", "config"]
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "production_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        return {
            "statistically_significant": execution_result.get("statistical_significance", False),
            "p_value": execution_result.get("p_value", 1.0),
            "improvement_pct": max(
                (r.get("improvement_pct", 0) for r in execution_result.get("quantitative_results", [])),
                default=0,
            ),
            "production_ready": execution_result.get("production_ready", False),
            "engineering_recommendations_count": len(execution_result.get("engineering_recommendations", [])),
            "limitations_count": len(execution_result.get("limitations", [])),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        sig = observations.get("statistically_significant", False)
        p = observations.get("p_value", 1.0)
        improvement = observations.get("improvement_pct", 0)
        prod_ready = observations.get("production_ready", False)

        if not sig:
            return (
                f"Results NOT statistically significant (p={p:.3f}). "
                "Do not promote to production. Increase sample size or revise hypothesis."
            )
        status = "PRODUCTION-READY" if prod_ready else "PROTOTYPE-STAGE"
        return (
            f"Research complete ({status}). "
            f"Statistically significant (p={p:.3f}), "
            f"{improvement:.1f}% improvement over baseline. "
            f"{observations.get('engineering_recommendations_count', 0)} engineering recommendations filed."
        )
