"""Sales Strategist Agent — enterprise sales strategy, playbooks, revenue forecasting."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class SalesStrategistAgent(BaseHiveAgent):
    """Enterprise Sales Strategist & Revenue Growth Director."""

    name: str = "SalesStrategist"
    capability: str = "SalesStrategist"
    temperature: float = 0.35
    max_attempts: int = 10

    SYSTEM_PROMPT = """You are an Enterprise Sales Strategist & Revenue Growth Director for CerebroHive EIOS.

SALES PHILOSOPHY:
- Sell outcomes, not features — enterprise buyers buy ROI and risk reduction
- CerebroHive positioning: Enterprise AI Operating System that replaces fragmented AI point solutions
- Every deal needs a champion, an economic buyer, a technical buyer, and a coach
- MEDDIC discipline: Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion

CEREBROHIVE VALUE PROPOSITIONS:
1. Intelligence: AI agents that reason, plan, and execute autonomously
2. Reliability: 99.99% uptime, enterprise SLAs, audit trails
3. Security: Zero Trust, SOC 2 Type II, GDPR/HIPAA ready
4. Scalability: Kubernetes-native, scales to millions of tasks/day
5. Developer Experience: API-first, MCP-compatible, 20+ connectors on day one

ICP (Ideal Customer Profile):
- Firmographic: Mid-to-large enterprise (500+ employees), $100M+ revenue
- Industry: Financial services, healthcare, technology, retail, manufacturing
- Tech maturity: Cloud-native, Kubernetes, existing LLM experimentation
- Trigger events: Failed point-solution sprawl, AI governance mandate, cost consolidation

PRICING FRAMEWORK:
- Land: Platform fee + per-agent seat + usage (task volume)
- Expand: Additional agents, connectors, enterprise features
- Targets: $50k–$500k ACV, 3-year ELA preferred

COMPETITIVE POSITIONING:
- vs Microsoft Copilot: More extensible, vendor-agnostic, developer-first
- vs Salesforce Einstein: Broader than CRM, true multi-agent orchestration
- vs Custom builds: 10× faster time-to-value, maintained and updated"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Sales objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Create a sales strategy plan with JSON output:
{{
  "strategy_type": "new_logo|expansion|renewal|competitive_displacement",
  "target_account": "...",
  "buyer_personas": [{{"role": "...", "pain": "...", "value_prop": "..."}}],
  "meddic": {{"metrics": "...", "economic_buyer": "...", "decision_criteria": "...", "decision_process": "...", "identified_pain": "...", "champion": "..."}},
  "value_proposition": "...",
  "competitive_risks": ["...", ...],
  "proof_points": ["case study | benchmark | reference", ...],
  "next_steps": ["...", ...],
  "deal_timeline_days": 0,
  "estimated_acv": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "strategy_type": "new_logo"}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Sales plan:
{json.dumps(plan, indent=2)}

Produce the sales execution package with JSON output:
{{
  "deal_qualified": true/false,
  "disqualification_reasons": ["...", ...],
  "sales_package": {{
    "executive_email": "...",
    "discovery_questions": ["...", ...],
    "demo_narrative": "...",
    "objection_handlers": [{{"objection": "...", "response": "..."}}],
    "pricing_proposal": "...",
    "next_step_email": "..."
  }},
  "meddic_completeness_pct": 0,
  "estimated_close_probability_pct": 0,
  "forecast_category": "pipeline|best_case|commit|closed_won"
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "deal_qualified": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        return {
            "deal_qualified": execution_result.get("deal_qualified", False),
            "meddic_completeness": execution_result.get("meddic_completeness_pct", 0),
            "close_probability": execution_result.get("estimated_close_probability_pct", 0),
            "forecast_category": execution_result.get("forecast_category", "pipeline"),
            "disqualification_reasons": len(execution_result.get("disqualification_reasons", [])),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        if not observations.get("deal_qualified"):
            return (
                f"DEAL DISQUALIFIED — {observations.get('disqualification_reasons', 0)} reason(s). "
                "Do not invest further sales resources. Mark as closed-lost."
            )
        meddic = observations.get("meddic_completeness", 0)
        prob = observations.get("close_probability", 0)
        category = observations.get("forecast_category", "pipeline")
        return (
            f"Deal qualified. MEDDIC completeness: {meddic}%, "
            f"close probability: {prob}%, forecast: {category}. "
            "Sales package ready. Advance to next stage."
        )
