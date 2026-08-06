"""Marketing Strategist agent skills — GTM, brand, SEO, content, and growth marketing."""
from __future__ import annotations
import json
from typing import Any, Optional
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except ImportError:
    class BaseTool:
        name: str = ""
        description: str = ""
        def run(self, **kwargs: Any) -> str: return self._run(**kwargs)
        def _run(self, **kwargs: Any) -> str: raise NotImplementedError

class BrandInput(BaseModel):
    product: str = Field(..., description="Product or feature to position.")
    audience: str = Field(..., description="Target audience segment.")
    competitors: Optional[str] = Field(None, description="Comma-separated competitor names.")

class ContentInput(BaseModel):
    topic: str = Field(..., description="Content topic.")
    format: str = Field(default="blog", description="Content format: blog|whitepaper|case-study|video|webinar.")
    audience: str = Field(default="enterprise", description="Target audience: enterprise|developer|executive.")
    word_count: int = Field(default=1500, description="Target word count.")

class CampaignInput(BaseModel):
    objective: str = Field(..., description="Campaign objective.")
    channel: str = Field(default="linkedin", description="Channel: linkedin|email|content|events|devrel.")
    budget_assumption: str = Field(default="medium", description="Budget: low|medium|high.")
    timeline_weeks: int = Field(default=6, description="Campaign duration in weeks.")

class SEOInput(BaseModel):
    page: str = Field(..., description="Page or topic to optimise.")
    keyword_focus: str = Field(..., description="Primary keyword target.")
    intent: str = Field(default="informational", description="Search intent: informational|commercial|transactional.")


class BrandStrategySkill(BaseTool):
    name: str = "brand_strategy"
    description: str = "Develop brand positioning, messaging framework, and value proposition for CerebroHive."
    def _run(self, product: str, audience: str, competitors: str = "") -> str:
        return json.dumps({
            "positioning_statement": f"For {audience} who need enterprise AI orchestration, CerebroHive {product} is the Enterprise Intelligence Operating System that provides [key benefit] — unlike [competitors], CerebroHive [unique differentiator].",
            "messaging_pillars": ["Intelligence at Enterprise Scale", "Production-Grade Reliability", "Developer-First Experience", "Governance & Security Built-In"],
            "tone_of_voice": {"Attributes": ["Authoritative but approachable", "Technical without being exclusive", "Confident without hyperbole"], "Avoid": ["Buzzwords without substance", "Passive voice", "Vague superlatives like 'revolutionary'"]},
            "brand_proof_points": ["99.99% platform availability", "Zero-trust security architecture", "MCP-native — open standards", "< 500ms LLM response latency"],
        }, indent=2)

class GTMStrategySkill(BaseTool):
    name: str = "go_to_market_strategy"
    description: str = "Design go-to-market strategies: launch phases, channel mix, partner strategy, and success metrics."
    def _run(self, product: str, audience: str, competitors: str = "") -> str:
        return json.dumps({
            "phases": {
                "Phase 1 — Foundation (Weeks 1-4)": "Developer advocacy, technical documentation, early adopter program",
                "Phase 2 — Launch (Weeks 5-8)": "Product Hunt, press release, analyst briefings, content blitz",
                "Phase 3 — Growth (Weeks 9-16)": "Paid demand gen, events, case studies, partnership activation",
                "Phase 4 — Scale (Weeks 17+)": "Account-based marketing for enterprise, channel partners",
            },
            "channels": {"Owned": ["Blog", "Docs", "Email list", "GitHub"], "Earned": ["Press", "Analyst coverage", "Community"], "Paid": ["LinkedIn Ads", "Sponsored content", "Events"]},
            "success_metrics": {"Week 4": "1K developer signups", "Week 8": "100 enterprise trials", "Week 16": "10 paying enterprise customers"},
        }, indent=2)

class ContentStrategySkill(BaseTool):
    name: str = "content_strategy"
    description: str = "Design content strategy: editorial calendar, content types, distribution, and SEO alignment."
    def _run(self, topic: str, format: str = "blog", audience: str = "enterprise", word_count: int = 1500) -> str:
        return json.dumps({
            "content_calendar": "Publish 2x/week: 1 technical (developer-focused) + 1 strategic (executive/architect-focused)",
            "content_types": {
                "Thought Leadership": "AI industry trends, architecture patterns, engineering insights — builds authority",
                "Technical Tutorials": "Hands-on guides — drives developer adoption and SEO",
                "Case Studies": "Customer outcomes with quantified results — drives enterprise consideration",
                "Research Reports": "Original data — generates backlinks and press coverage",
                "Product Announcements": "Feature releases — drives trial signups",
            },
            "brief": {"topic": topic, "format": format, "audience": audience, "word_count": word_count, "outline": ["Hook: compelling statistic or question", "Problem: pain the reader has", "Solution: how CerebroHive solves it", "Proof: data, case study, demo", "CTA: specific next action"]},
        }, indent=2)

class SEOStrategySkill(BaseTool):
    name: str = "seo_strategy"
    description: str = "Plan SEO strategy: keyword research, content gaps, page optimisation, and link building."
    def _run(self, page: str, keyword_focus: str, intent: str = "informational") -> str:
        return json.dumps({
            "primary_keyword": keyword_focus,
            "intent": intent,
            "target_keywords": [keyword_focus, f"enterprise {keyword_focus}", f"{keyword_focus} platform", f"best {keyword_focus} software"],
            "on_page": {"title": f"{keyword_focus.title()} | CerebroHive", "meta_description": f"150-155 char description including '{keyword_focus}'", "H1": f"Exact match or close variant of {keyword_focus}", "schema": "SoftwareApplication or Article structured data"},
            "content_gaps": f"Identify top 10 ranking pages for '{keyword_focus}' — produce more comprehensive content",
            "link_building": "Digital PR, technical guest posts, documentation links, open-source project citations",
        }, indent=2)

class DeveloperMarketingSkill(BaseTool):
    name: str = "developer_marketing"
    description: str = "Build developer advocacy: technical content, open source, community, and DevRel programs."
    def _run(self, product: str, audience: str = "developer", competitors: str = "") -> str:
        return json.dumps({
            "devrel_pillars": {"Educate": "Tutorials, docs, workshops, conference talks", "Enable": "SDKs, CLI, templates, examples, IDE plugins", "Engage": "Discord, GitHub Discussions, Twitter/X, Hackathons"},
            "content": ["Quick start guide (< 5 min to first value)", "API reference (generated from OpenAPI)", "Architecture cookbook — patterns and examples", "Video demos — YouTube channel", "Weekly newsletter for AI engineers"],
            "community": "Discord server: #general, #support, #showcase, #roadmap, #announcements",
            "metrics": {"Developer signups": "Weekly growth rate", "GitHub stars": "Monthly growth", "Doc page views": "Unique monthly", "Forum posts": "Questions answered / week"},
        }, indent=2)

class CampaignPlanningSkill(BaseTool):
    name: str = "campaign_planning"
    description: str = "Plan marketing campaigns: objectives, audience, channels, timeline, budget, and KPIs."
    def _run(self, objective: str, channel: str = "linkedin", budget_assumption: str = "medium", timeline_weeks: int = 6) -> str:
        return json.dumps({
            "campaign": {
                "objective": objective, "channel": channel,
                "audience": "Enterprise CTOs, AI Engineering Directors, Solution Architects",
                "timeline": f"{timeline_weeks} weeks",
                "budget_assumption": budget_assumption,
            },
            "phases": {"Week 1-2": "Creative development, audience list building", "Week 3-5": "Active campaign, A/B testing", "Week 6": "Analysis and optimisation"},
            "kpis": {"Awareness": "Impressions, reach", "Consideration": "Clicks, CTR, time on page", "Conversion": "Trial signups, demo requests, MQLs"},
            "a_b_tests": ["Headline A vs B", "CTA: 'Start Free Trial' vs 'Book a Demo'", "Image: product screenshot vs abstract visual"],
        }, indent=2)

class CompetitiveAnalysisSkill(BaseTool):
    name: str = "competitive_analysis"
    description: str = "Analyse competitors: positioning gaps, feature comparison, pricing, and messaging opportunities."
    def _run(self, product: str, audience: str, competitors: str = "") -> str:
        competitor_list = [c.strip() for c in competitors.split(",") if c.strip()] or ["LangChain Cloud", "Microsoft AutoGen", "CrewAI Cloud"]
        return json.dumps({
            "competitors": competitor_list,
            "framework": {"Positioning": "Map each competitor on: enterprise-readiness vs developer-friendliness axes", "Feature gaps": "Identify where competitors are weak — CerebroHive strengths", "Messaging gaps": "Claims competitors are NOT making — white space for CerebroHive", "Pricing": "Map pricing tiers — identify mid-market opportunity"},
            "win_themes": ["Enterprise governance and compliance built-in (competitors bolt it on)", "Provider-agnostic from day 1 (competitors are OpenAI-centric)", "NATS JetStream backbone — 10x scale vs HTTP-based orchestrators"],
        }, indent=2)

MARKETING_STRATEGIST_SKILLS = [
    BrandStrategySkill(), GTMStrategySkill(), ContentStrategySkill(),
    SEOStrategySkill(), DeveloperMarketingSkill(), CampaignPlanningSkill(),
    CompetitiveAnalysisSkill(),
]

__all__ = ["MARKETING_STRATEGIST_SKILLS"]
