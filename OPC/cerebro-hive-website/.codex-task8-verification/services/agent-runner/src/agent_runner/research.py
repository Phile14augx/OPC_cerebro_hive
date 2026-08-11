"""ResearchAgent — gathers information, synthesizes findings, cites sources."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest

_SYSTEM = """\
You are the Research agent of HiveSwarm, an enterprise multi-agent operating system.

Your role:
- Investigate topics thoroughly using available knowledge
- Synthesize information from multiple perspectives
- Identify key facts, trends, and trade-offs
- Provide actionable insights backed by clear reasoning
- Be honest about uncertainty and knowledge limits

Respond in valid JSON with this structure:
{
  "summary": "executive summary (2-3 sentences)",
  "findings": [
    {"finding": "...", "confidence": 0.0–1.0, "rationale": "..."}
  ],
  "key_concepts": ["concept 1", "concept 2"],
  "trade_offs": [{"aspect": "...", "pros": [...], "cons": [...]}],
  "recommendations": ["recommendation 1", ...],
  "knowledge_gaps": ["gap 1"],
  "confidence": 0.0–1.0,
  "sources": ["source description 1"]
}
"""


class ResearchAgent(BaseHiveAgent):
    capability = "Research"
    name = "HiveSwarm Researcher"

    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        # Decompose research into sub-questions
        topic = req.objective
        return {
            "topic": topic,
            "research_questions": [
                f"What is the current state of: {topic}?",
                f"What are the key approaches and trade-offs?",
                f"What are the best practices and common pitfalls?",
                f"What are recent developments or trends?",
            ],
            "depth": req.input.get("depth", "standard"),
            "focus_areas": req.input.get("focus_areas", []),
        }

    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        questions = plan.get("research_questions", [])
        focus = plan.get("focus_areas", [])

        prompt = f"""Research topic: {req.objective}

Research questions to address:
{chr(10).join(f'- {q}' for q in questions)}

Focus areas: {', '.join(focus) if focus else 'general'}
Context: {json.dumps({k: v for k, v in req.input.items() if k not in ('objective', 'name')}, indent=2)}

Provide comprehensive research findings with clear reasoning."""

        raw = self._call_llm(_SYSTEM, prompt)
        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            result = {
                "summary": raw[:300] if len(raw) > 300 else raw,
                "findings": [{"finding": raw, "confidence": 0.7, "rationale": "LLM synthesis"}],
                "key_concepts": [],
                "trade_offs": [],
                "recommendations": [],
                "knowledge_gaps": [],
                "confidence": 0.7,
                "sources": ["internal knowledge base"],
            }
        return result

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        has_summary = bool(result.get("summary"))
        findings = result.get("findings", [])
        n_findings = len(findings)
        avg_confidence = (
            sum(f.get("confidence", 0.0) for f in findings) / n_findings
            if n_findings > 0 else 0.0
        )
        quality = 0.0
        if has_summary:
            quality += 0.3
        if n_findings >= 2:
            quality += 0.3
        if result.get("recommendations"):
            quality += 0.2
        if avg_confidence > 0.6:
            quality += 0.2
        return {
            "hasOutput": has_summary,
            "findingCount": n_findings,
            "avgFindingConfidence": round(avg_confidence, 3),
            "qualityScore": round(min(1.0, quality), 3),
            "notes": f"{n_findings} findings, avg confidence {avg_confidence:.2f}.",
        }

    def reflect(self, req: ExecuteRequest, result: dict[str, Any], observation: dict[str, Any]) -> dict[str, Any]:
        gaps = result.get("knowledge_gaps", [])
        return {
            "objectiveClarity": "clear",
            "executionStrategy": "llm_synthesis",
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": [
                f"Knowledge gap identified: {g}" for g in gaps
            ] or ["Research coverage appears complete"],
        }
