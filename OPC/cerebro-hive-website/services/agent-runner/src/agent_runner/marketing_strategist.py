"""Marketing Strategist agent — GTM strategy, brand positioning, and growth."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse

_SYSTEM = """You are the Enterprise Marketing Strategist for CerebroHive EIOS.

MARKETING MANDATE:
- Position CerebroHive as the global leader in Enterprise AI, Agentic Systems, and EIOS
- Every claim must be technically accurate — never overstate capabilities
- Lead with business value, support with technical credibility
- Data-driven decisions — KPIs defined before every campaign
- Long-term brand equity over short-term vanity metrics

TARGET PERSONAS:
- Enterprise CIO/CTO: digital transformation, AI governance, ROI, security
- Enterprise Architects: technical depth, architecture patterns, scalability
- AI Engineers / Developers: API quality, developer experience, documentation, open standards
- Product Managers: roadmap alignment, time-to-market, integration
- Investors / Analysts: market position, growth metrics, technical differentiation

VALUE PROPOSITION FRAMEWORK:
1. INTELLIGENCE: CerebroHive EIOS is the operating system for enterprise AI — orchestrating agents,
   knowledge, workflows, and decisions across the enterprise
2. RELIABILITY: Production-grade — 99.99% availability, audit trails, governance built-in
3. SCALABILITY: From 10 to 10,000 concurrent AI agents — NATS JetStream backbone
4. SECURITY: Zero Trust, OWASP compliant, SOC 2 alignment, data sovereignty
5. DEVELOPER EXPERIENCE: MCP-first, OpenAPI contracts, SDK in TypeScript + Python

MESSAGING RULES:
- Lead with outcomes, not features: "reduce decision latency by 80%" not "we use RAG"
- Use the customer's language — map technical features to their business problems
- Proof points: quantified metrics, case studies, analyst quotes
- Never use: "AI-powered", "game-changing", "revolutionary", "disrupting" without substance

OUTPUT FORMAT (JSON):
{
  "strategy": {"objective": str, "target_audience": list, "key_messages": list, "differentiators": list},
  "positioning": {"headline": str, "subheadline": str, "value_props": list, "proof_points": list},
  "campaigns": [{"name": str, "channel": str, "audience": str, "content": str, "kpis": list, "timeline": str}],
  "content": [{"type": str, "title": str, "audience": str, "outline": list, "channel": str}],
  "gtm_plan": {"phases": list, "channels": list, "timeline": str, "success_metrics": dict},
  "seo": {"target_keywords": list, "content_gaps": list, "page_recommendations": list},
  "developer_advocacy": {"initiatives": list, "content": list, "community": list},
  "analyst_relations": {"target_analysts": list, "briefing_topics": list, "timeline": str},
  "kpis": {"targets": dict, "measurement_cadence": str}
}"""


class MarketingStrategistAgent(BaseHiveAgent):
    """Enterprise Marketing Strategist — GTM, brand positioning, and growth marketing."""

    capability = "MarketingStrategist"
    name = "Marketing Strategist — Enterprise Marketing Strategist & Brand Growth Director"

    def __init__(self, llm: Any) -> None:
        super().__init__(llm=llm, temperature=0.4, max_attempts=12)

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        user_prompt = f"""
Marketing initiative request:
{json.dumps(request.input, indent=2)}

Develop a comprehensive enterprise marketing strategy and execution plan.

Steps:
1. AUDIENCE ANALYSIS — segment target personas, buying stage, messaging resonance
2. POSITIONING — headline, value props, key differentiators, proof points
3. MESSAGING FRAMEWORK — per-persona message map, objection handling
4. CAMPAIGN PLAN — channel selection, content calendar, launch timing
5. CONTENT STRATEGY — thought leadership, SEO content, developer content, social
6. GO-TO-MARKET — phases, channels, partnerships, launch checklist
7. SEO STRATEGY — keyword opportunities, content gaps, page recommendations
8. DEVELOPER ADVOCACY — community, open source, devrel initiatives
9. ANALYST RELATIONS — target firms, briefing topics, timeline
10. KPIs — specific measurable targets with measurement cadence

Return JSON matching the OUTPUT FORMAT. Ensure all claims are technically accurate.
"""
        raw = self._call_llm(_SYSTEM, user_prompt)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw, re.DOTALL)
            return json.loads(m.group()) if m else {"raw": raw}

    def execute(self, plan: dict[str, Any]) -> dict[str, Any]:
        strategy = plan.get("strategy", {})
        positioning = plan.get("positioning", {})
        campaigns = plan.get("campaigns", [])
        content = plan.get("content", [])
        gtm = plan.get("gtm_plan", {})
        seo = plan.get("seo", {})
        devrel = plan.get("developer_advocacy", {})
        kpis = plan.get("kpis", {})

        # Validate strategy
        has_target_audience = bool(strategy.get("target_audience"))
        has_differentiators = bool(strategy.get("differentiators"))

        # Validate positioning
        has_headline = bool(positioning.get("headline"))
        has_value_props = bool(positioning.get("value_props"))
        has_proof_points = bool(positioning.get("proof_points"))

        # Validate campaigns
        campaigns_with_kpis = [c for c in campaigns if c.get("kpis")]
        multi_channel = len({c.get("channel", "") for c in campaigns}) > 1

        # Validate content
        thought_leadership = [c for c in content if c.get("type", "").lower() in ("whitepaper", "blog", "research", "case-study", "case_study")]
        developer_content = [c for c in content if "developer" in c.get("audience", "").lower() or "engineer" in c.get("audience", "").lower()]

        # Validate KPIs
        kpi_targets = kpis.get("targets", {})
        has_kpi_targets = len(kpi_targets) >= 3

        production_ready = (
            has_target_audience
            and has_headline
            and has_value_props
            and has_proof_points
            and len(campaigns) > 0
            and has_kpi_targets
        )

        return {
            **plan,
            "execution_metrics": {
                "has_target_audience": has_target_audience,
                "has_differentiators": has_differentiators,
                "has_positioning_headline": has_headline,
                "has_value_props": has_value_props,
                "has_proof_points": has_proof_points,
                "campaign_count": len(campaigns),
                "campaigns_with_kpis": len(campaigns_with_kpis),
                "multi_channel": multi_channel,
                "content_pieces": len(content),
                "thought_leadership_pieces": len(thought_leadership),
                "developer_content_pieces": len(developer_content),
                "kpi_target_count": len(kpi_targets),
                "has_kpi_targets": has_kpi_targets,
                "has_gtm_plan": bool(gtm),
                "has_seo_strategy": bool(seo),
                "has_devrel_strategy": bool(devrel),
                "production_ready": production_ready,
            },
        }

    def _score_implementation(self, plan: dict[str, Any]) -> float:
        score = 0.0
        for k in ["strategy", "positioning", "campaigns", "content", "gtm_plan", "kpis"]:
            if plan.get(k):
                score += 12.0
        metrics = plan.get("execution_metrics", {})
        if metrics.get("has_proof_points"):
            score += 8.0
        if metrics.get("multi_channel"):
            score += 5.0
        if metrics.get("thought_leadership_pieces", 0) > 0:
            score += 5.0
        if metrics.get("has_kpi_targets"):
            score += 5.0
        return min(score, 100.0)

    def observe(self, result: dict[str, Any]) -> dict[str, Any]:
        metrics = result.get("execution_metrics", {})
        score = self._score_implementation(result)
        return {
            "implementationScore": score,
            "hasTargetAudience": metrics.get("has_target_audience", False),
            "hasPositioningHeadline": metrics.get("has_positioning_headline", False),
            "hasValueProps": metrics.get("has_value_props", False),
            "hasProofPoints": metrics.get("has_proof_points", False),
            "campaignCount": metrics.get("campaign_count", 0),
            "campaignsWithKPIs": metrics.get("campaigns_with_kpis", 0),
            "multiChannel": metrics.get("multi_channel", False),
            "contentPieces": metrics.get("content_pieces", 0),
            "thoughtLeadershipPieces": metrics.get("thought_leadership_pieces", 0),
            "developerContentPieces": metrics.get("developer_content_pieces", 0),
            "kpiTargetCount": metrics.get("kpi_target_count", 0),
            "hasGTMPlan": metrics.get("has_gtm_plan", False),
            "hasSEOStrategy": metrics.get("has_seo_strategy", False),
            "hasDevRelStrategy": metrics.get("has_devrel_strategy", False),
            "productionReady": metrics.get("production_ready", False),
        }

    def reflect(self, observations: dict[str, Any]) -> list[str]:
        issues: list[str] = []

        if not observations.get("hasTargetAudience"):
            issues.append("CRITICAL: No target audience defined — marketing without audience is noise")
        if not observations.get("hasPositioningHeadline"):
            issues.append("CRITICAL: No positioning headline — brand strategy missing")
        if not observations.get("hasValueProps"):
            issues.append("CRITICAL: No value propositions — messaging framework incomplete")
        if not observations.get("hasProofPoints"):
            issues.append("WARNING: No proof points — claims lack credibility")
        if observations.get("campaignCount", 0) == 0:
            issues.append("CRITICAL: No campaigns produced")
        if observations.get("campaignsWithKPIs", 0) < observations.get("campaignCount", 0):
            issues.append("WARNING: Some campaigns missing KPIs — measurement impossible")
        if not observations.get("multiChannel"):
            issues.append("WARNING: Single-channel strategy — KPI: qualified_lead_growth ≥ 25% at risk")
        if observations.get("thoughtLeadershipPieces", 0) == 0:
            issues.append("WARNING: No thought leadership content — KPI: brand_awareness_growth ≥ 25% at risk")
        if observations.get("kpiTargetCount", 0) < 3:
            issues.append("WARNING: Fewer than 3 KPI targets defined — campaign ROI unverifiable")
        if not observations.get("hasGTMPlan"):
            issues.append("WARNING: No GTM plan — launch readiness unknown")
        if not observations.get("hasDevRelStrategy"):
            issues.append("WARNING: No DevRel strategy — KPI: developer_community_growth ≥ 20% at risk")

        kpi_checks = {
            "campaign_roi ≥ 300%": observations.get("kpiTargetCount", 0) >= 3,
            "brand_awareness_growth ≥ 25%": observations.get("thoughtLeadershipPieces", 0) > 0,
            "developer_community_growth ≥ 20%": observations.get("hasDevRelStrategy"),
            "product_launch_success ≥ 95%": observations.get("hasGTMPlan"),
        }
        for kpi, passing in kpi_checks.items():
            if not passing:
                issues.append(f"KPI RISK: {kpi} — not satisfied")

        return issues
