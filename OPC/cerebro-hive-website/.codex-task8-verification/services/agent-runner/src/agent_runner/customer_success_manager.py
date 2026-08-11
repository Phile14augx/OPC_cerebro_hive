"""Customer Success Manager Agent — success plans, health scoring, QBRs, churn prevention."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class CustomerSuccessManagerAgent(BaseHiveAgent):
    """Senior Customer Success Manager & Enterprise Outcomes Lead."""

    name: str = "CustomerSuccessManager"
    capability: str = "CustomerSuccessManager"
    temperature: float = 0.3
    max_attempts: int = 10

    SYSTEM_PROMPT = """You are a Senior Customer Success Manager & Enterprise Outcomes Lead for CerebroHive EIOS.

SUCCESS PHILOSOPHY:
- CS mission: ensure every customer achieves measurable ROI, then expand and advocate
- You are the voice of the customer inside CerebroHive — represent them in every product/engineering discussion
- Proactive beats reactive: identify risks 90 days before renewal, not 30 days
- Outcomes over activities: QBRs show business impact, not feature lists

NRR TARGETS:
- Net Revenue Retention: ≥130%
- Gross Dollar Retention: ≥95%
- NPS: ≥60
- Time to Value: ≤14 days from contract to first measurable outcome

CUSTOMER HEALTH SCORING (0-100):
- Product adoption (40%): MAU, feature breadth, API usage
- Engagement (20%): QBR attendance, responsiveness, champion activity
- Support health (15%): open tickets, escalations, CSAT
- Stakeholder sentiment (15%): exec sponsor engagement, NPS feedback
- Contract health (10%): payment history, upcoming renewal risk

CHURN RISK INDICATORS (act immediately):
- Usage declining >20% MoM for 2+ months
- Champion departed without replacement identified
- Escalation unresolved >7 days
- Missed QBR or no response to outreach >2 weeks
- Competitor evaluation confirmed
- ROI not demonstrated at 90-day mark

EXPANSION TRIGGERS (create upsell opportunities):
- Feature limit reached (quota exhaustion)
- New use case identified in discovery
- New department/team expressing interest
- Platform maturity milestone reached
- M&A activity (new entities to onboard)"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""CS objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Create a customer success plan with JSON output:
{{
  "customer_name": "...",
  "cs_motion": "onboarding|adoption|expansion|retention|renewal|recovery",
  "business_objectives": ["...", ...],
  "current_health_score": 0,
  "success_metrics": [{{"metric": "...", "baseline": "...", "target": "...", "timeline": "..."}}],
  "milestones": [{{"day": 0, "milestone": "...", "owner": "..."}}],
  "risk_flags": ["...", ...],
  "stakeholder_map": [{{"name": "...", "role": "...", "sentiment": "positive|neutral|risk"}}],
  "expansion_opportunity": "...",
  "renewal_date": "YYYY-MM-DD"
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "cs_motion": "adoption"}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""CS plan:
{json.dumps(plan, indent=2)}

Produce the CS execution plan with JSON output:
{{
  "success_plan_ready": true/false,
  "churn_risk": "low|medium|high|critical",
  "churn_risk_reasons": ["...", ...],
  "action_items": [{{"action": "...", "owner": "...", "due_days": 0, "priority": "high|medium|low"}}],
  "qbr_agenda": ["...", ...],
  "roi_calculation": {{"investment": "...", "value_delivered": "...", "roi_multiple": 0}},
  "expansion_play": "...",
  "executive_summary": "...",
  "next_90_day_plan": "..."
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "success_plan_ready": False, "churn_risk": "medium"}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        return {
            "success_plan_ready": execution_result.get("success_plan_ready", False),
            "churn_risk": execution_result.get("churn_risk", "medium"),
            "action_count": len(execution_result.get("action_items", [])),
            "has_roi_calculation": bool(execution_result.get("roi_calculation")),
            "has_expansion_play": bool(execution_result.get("expansion_play")),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        risk = observations.get("churn_risk", "medium")
        if risk == "critical":
            return (
                "⚠ CRITICAL CHURN RISK — escalate to VP CS and account executive immediately. "
                "Executive outreach required within 24 hours."
            )
        if risk == "high":
            return (
                "HIGH churn risk detected. Immediate outreach required. "
                "Recovery playbook activated. Weekly check-ins scheduled."
            )
        plan_ready = observations.get("success_plan_ready", False)
        if not plan_ready:
            return "Success plan incomplete. Missing success metrics or milestone owners."
        return (
            f"Success plan active. Churn risk: {risk}. "
            f"{observations.get('action_count', 0)} action items assigned. "
            f"ROI calculation: {'✓' if observations.get('has_roi_calculation') else '✗'}. "
            f"Expansion play: {'✓' if observations.get('has_expansion_play') else '✗'}."
        )
