"""AI Engineer agent — LLM apps, RAG, multi-agent systems, and AI governance."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Senior AI Engineer for CerebroHive EIOS.

AI ENGINEERING MANDATE:
- Provider-agnostic by design — never tightly couple to one LLM provider
- Abstract all LLM calls behind a unified ModelRouter interface
- Every LLM call: temperature, max_tokens, timeout, fallback model configured
- Prompt templates stored in version-controlled prompt library — never inline strings
- Cost tracking per request — token counts, model pricing, budget alerts
- Latency SLA: streaming response start ≤ 500ms, full response ≤ 30s

RAG PIPELINE STANDARDS:
- Hybrid search: dense (embeddings) + sparse (BM25) with RRF fusion
- Chunking strategy documented — chunk size, overlap, splitter type per content type
- Embedding model: text-embedding-3-large or equivalent — deterministic, batch-enabled
- Retrieval evaluation: precision@k, recall@k, MRR per knowledge domain
- Hallucination detection: citation grounding — every factual claim cited from retrieved docs
- Vector DB: Qdrant or pgvector — namespace per knowledge domain, soft-delete enabled

AGENT/MULTI-AGENT STANDARDS:
- Tool definitions: JSON Schema typed, descriptions must enable zero-shot tool selection
- Max tool call depth: 10 per task turn — prevent infinite loops
- Every agent has: system prompt, tool list, memory (episodic + semantic), guardrails
- Output validation: Pydantic model or zod schema on every structured LLM output
- Guardrails: input sanitization + output validation + PII redaction + safety classifier
- Reflection loop: plan → execute → observe → reflect — max_attempts configurable

EVALUATION FRAMEWORK (required for every AI capability):
- Ground truth dataset: ≥ 50 Q/A pairs per knowledge domain
- Metrics: accuracy, hallucination rate, latency p50/p95/p99, cost per query
- Regression suite: run on every PR — fail if accuracy drops ≥ 2% from baseline
- LangSmith / W&B for experiment tracking

AI SAFETY:
- Prompt injection detection on every user input
- Output safety classifier before returning to user
- Rate limiting per user and per model provider
- PII detection and redaction in retrieval context
- Audit log: every LLM call — model, tokens, user, task, response hash

GIT WORKFLOW:
One Feature → One Worktree → One Branch → One PR → One Merge → Delete Worktree

OUTPUT FORMAT (JSON):
{
  "model_routing": {"primary": str, "fallback": str, "temperature": float, "max_tokens": int},
  "prompt_templates": [{"name": str, "version": str, "template": str, "variables": list}],
  "rag_pipeline": {"embedding_model": str, "chunk_size": int, "retrieval_k": int, "reranker": str, "search_type": str},
  "agent_definition": {"tools": list, "max_attempts": int, "memory_type": str, "guardrails": list},
  "evaluation": {"dataset_size": int, "metrics": list, "baseline_accuracy": float},
  "safety": {"input_guardrails": list, "output_guardrails": list, "pii_redaction": bool},
  "observability": {"trace_spans": list, "cost_tracking": bool, "latency_slo_ms": int},
  "git_workflow": {"worktree": str, "branch": str, "pr_title": str},
  "implementation": [{"path": str, "type": str, "code": str}]
}"""


class AIEngineerAgent(BaseHiveAgent):
    """Senior AI Engineer — LLM applications, RAG, multi-agent systems, and AI governance."""

    capability = "AIEngineer"
    name = "AI Engineer — Senior AI Engineer & Agentic Systems Engineer"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.2, max_attempts=20)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
AI capability request:
{json.dumps(request.input, indent=2)}

Design and implement an enterprise-grade AI system.

Steps:
1. MODEL SELECTION — choose primary + fallback models, justify for task type
2. PROMPT ARCHITECTURE — design versioned prompt templates, chain-of-thought steps
3. RAG DESIGN — embedding strategy, chunking, hybrid search, reranking
4. AGENT WORKFLOW — tool definitions, execution loop, memory strategy, reflection
5. GUARDRAILS — input/output safety checks, PII handling, rate limits
6. EVALUATION — metrics, dataset requirements, CI regression suite
7. OBSERVABILITY — trace spans, cost tracking, latency SLOs
8. IMPLEMENTATION — Python/TypeScript code, file structure
9. GIT WORKFLOW — worktree, branch, PR title

Return JSON matching the OUTPUT FORMAT.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        routing = plan.get("model_routing", {})
        prompts = plan.get("prompt_templates", [])
        rag = plan.get("rag_pipeline", {})
        agent_def = plan.get("agent_definition", {})
        evaluation = plan.get("evaluation", {})
        safety = plan.get("safety", {})
        observability = plan.get("observability", {})
        git = plan.get("git_workflow", {})
        impl = plan.get("implementation", [])

        # Model routing
        has_fallback = bool(routing.get("fallback"))
        provider_agnostic = routing.get("primary", "").lower() not in ("openai", "anthropic")  # abstracted

        # Prompts
        versioned_prompts = [p for p in prompts if p.get("version")]

        # RAG
        has_rag = bool(rag)
        hybrid_search = rag.get("search_type", "") in ("hybrid", "rrf", "ensemble")
        has_reranker = bool(rag.get("reranker"))

        # Guardrails
        input_guardrails = safety.get("input_guardrails", [])
        output_guardrails = safety.get("output_guardrails", [])
        pii_redaction = safety.get("pii_redaction", False)

        # Evaluation
        dataset_size = evaluation.get("dataset_size", 0)
        metrics = evaluation.get("metrics", [])

        # Observability
        cost_tracking = observability.get("cost_tracking", False)

        # Git
        git_ok = all(k in git for k in ["branch", "pr_title"])

        production_ready = (
            bool(routing.get("primary"))
            and has_fallback
            and len(prompts) > 0
            and len(input_guardrails) > 0
            and len(output_guardrails) > 0
            and dataset_size >= 20
            and cost_tracking
            and git_ok
        )

        return {
            **plan,
            "execution_metrics": {
                "has_fallback_model": has_fallback,
                "versioned_prompt_count": len(versioned_prompts),
                "total_prompt_count": len(prompts),
                "has_rag_pipeline": has_rag,
                "hybrid_search": hybrid_search,
                "has_reranker": has_reranker,
                "input_guardrail_count": len(input_guardrails),
                "output_guardrail_count": len(output_guardrails),
                "pii_redaction": pii_redaction,
                "evaluation_dataset_size": dataset_size,
                "evaluation_metric_count": len(metrics),
                "cost_tracking": cost_tracking,
                "implementation_file_count": len(impl),
                "git_workflow_complete": git_ok,
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["model_routing", "prompt_templates", "agent_definition", "evaluation", "safety", "observability"]:
            if plan.get(k):
                score += 12.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("has_fallback_model"):
            score += 5.0
        if metrics.get("versioned_prompt_count", 0) > 0:
            score += 5.0
        if metrics.get("input_guardrail_count", 0) > 0 and metrics.get("output_guardrail_count", 0) > 0:
            score += 5.0
        if metrics.get("evaluation_dataset_size", 0) >= 50:
            score += 5.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "hasFallbackModel": metrics.get("has_fallback_model", False),
            "promptCount": metrics.get("total_prompt_count", 0),
            "versionedPromptCount": metrics.get("versioned_prompt_count", 0),
            "hasRAGPipeline": metrics.get("has_rag_pipeline", False),
            "hybridSearch": metrics.get("hybrid_search", False),
            "hasReranker": metrics.get("has_reranker", False),
            "inputGuardrailCount": metrics.get("input_guardrail_count", 0),
            "outputGuardrailCount": metrics.get("output_guardrail_count", 0),
            "piiRedaction": metrics.get("pii_redaction", False),
            "evaluationDatasetSize": metrics.get("evaluation_dataset_size", 0),
            "evaluationMetricCount": metrics.get("evaluation_metric_count", 0),
            "costTracking": metrics.get("cost_tracking", False),
            "gitWorkflowComplete": metrics.get("git_workflow_complete", False),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if not observations.get("hasFallbackModel"):
            issues.append("CRITICAL: No fallback model defined — single provider dependency")
        if observations.get("promptCount", 0) == 0:
            issues.append("CRITICAL: No prompt templates produced")
        if observations.get("versionedPromptCount", 0) < observations.get("promptCount", 0):
            issues.append("WARNING: Some prompts lack version field — prompt library governance required")
        if observations.get("inputGuardrailCount", 0) == 0:
            issues.append("CRITICAL: No input guardrails — AI safety compliance = 100% KPI at risk")
        if observations.get("outputGuardrailCount", 0) == 0:
            issues.append("CRITICAL: No output guardrails — hallucination / PII leakage risk")
        if not observations.get("piiRedaction"):
            issues.append("WARNING: PII redaction not configured — data privacy risk")
        if observations.get("evaluationDatasetSize", 0) < 20:
            issues.append("CRITICAL: Evaluation dataset < 20 samples — KPI: evaluation_pass_rate ≥ 98% unverifiable")
        if observations.get("evaluationDatasetSize", 0) < 50:
            issues.append("WARNING: Evaluation dataset < 50 samples — target ≥ 50 for statistical validity")
        if not observations.get("costTracking"):
            issues.append("WARNING: Cost tracking disabled — KPI: cost_optimization ≥ 20% unmonitorable")
        if not observations.get("gitWorkflowComplete"):
            issues.append("CRITICAL: Git workflow incomplete")
        if not observations.get("productionReady"):
            issues.append("BLOCKER: AI capability not production-ready")

        kpi_checks = {
            "hallucination_rate < 2%": observations.get("hasReranker") and observations.get("hasRAGPipeline"),
            "ai_safety_compliance = 100%": observations.get("inputGuardrailCount", 0) > 0 and observations.get("outputGuardrailCount", 0) > 0,
            "evaluation_pass_rate ≥ 98%": observations.get("evaluationDatasetSize", 0) >= 50,
            "prompt_reusability ≥ 90%": observations.get("versionedPromptCount", 0) > 0,
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
