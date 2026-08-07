"""Self-registration and heartbeat for agent-runner agents."""
from __future__ import annotations

import asyncio
import time

import httpx
import structlog

from .config import settings

log = structlog.get_logger(__name__)


def _spec(name, capabilities, concurrency, tags, agent_type, model, temperature):
    return {
        "name": name,
        "version": settings.agent_version,
        "owner": settings.agent_owner,
        "capabilities": capabilities,
        "concurrency": concurrency,
        "endpoint": settings.agent_runner_endpoint,
        "tags": tags,
        "metadata": {"agentType": agent_type, "model": model, "temperature": temperature, "reasoning": True, "memory": True},
    }


AGENT_SPECS = [
    # ── Strategic Core ──────────────────────────────────────────────────────
    _spec("hermes", ["CEO"], 3, ["core","executive","strategic"], "ceo", settings.ceo_model, 0.2),
    _spec("enterprise_architect", ["EnterpriseArchitect"], 3, ["core","architect","governance"], "enterprise_architect", settings.enterprise_architect_model, 0.1),
    _spec("project_manager", ["ProjectManager"], 3, ["core","project-manager","delivery"], "project_manager", settings.project_manager_model, 0.2),
    _spec("solution_architect", ["SolutionArchitect"], 3, ["core","architect","design"], "solution_architect", settings.solution_architect_model, 0.15),
    _spec("technical_lead", ["TechnicalLead"], 3, ["core","tech-lead","engineering"], "technical_lead", settings.technical_lead_model, 0.15),
    _spec("product_manager", ["ProductManager"], 3, ["core","product","roadmap"], "product_manager", settings.product_manager_model, 0.2),
    _spec("sales_strategist", ["SalesStrategist"], 3, ["core","sales","revenue"], "sales_strategist", settings.sales_strategist_model, 0.35),
    _spec("customer_success_manager", ["CustomerSuccessManager"], 3, ["core","cs","retention"], "customer_success_manager", settings.customer_success_manager_model, 0.3),

    # ── Engineering Specialists ─────────────────────────────────────────────
    _spec("backend_engineer", ["BackendEngineer"], 5, ["specialist","backend","api"], "backend_engineer", settings.backend_engineer_model, 0.1),
    _spec("frontend_engineer", ["FrontendEngineer"], 5, ["specialist","frontend","react"], "frontend_engineer", settings.frontend_engineer_model, 0.15),
    _spec("devops_sre", ["DevOpsSRE"], 5, ["specialist","devops","kubernetes"], "devops_sre", settings.devops_sre_model, 0.1),
    _spec("ai_engineer", ["AIEngineer"], 5, ["specialist","ai","rag"], "ai_engineer", settings.ai_engineer_model, 0.2),
    _spec("qa_engineer", ["QAEngineer"], 5, ["specialist","qa","testing"], "qa_engineer", settings.qa_engineer_model, 0.1),
    _spec("security_architect", ["SecurityArchitect"], 3, ["specialist","security","zero-trust"], "security_architect", settings.security_architect_model, 0.05),
    _spec("technical_writer", ["TechnicalWriter"], 3, ["specialist","docs","openapi"], "technical_writer", settings.technical_writer_model, 0.15),
    _spec("marketing_strategist", ["MarketingStrategist"], 3, ["specialist","marketing","gtm"], "marketing_strategist", settings.marketing_strategist_model, 0.4),
    _spec("research_scientist", ["ResearchScientist"], 3, ["specialist","research","ai"], "research_scientist", settings.research_scientist_model, 0.3),
    _spec("ux_designer", ["UXDesigner"], 3, ["specialist","ux","design"], "ux_designer", settings.ux_designer_model, 0.25),
    _spec("data_engineer", ["DataEngineer"], 5, ["specialist","data","pipelines"], "data_engineer", settings.data_engineer_model, 0.1),
    _spec("platform_engineer", ["PlatformEngineer"], 5, ["specialist","platform","idp"], "platform_engineer", settings.platform_engineer_model, 0.1),
    _spec("integration_engineer", ["IntegrationEngineer"], 5, ["specialist","integration","mcp"], "integration_engineer", settings.integration_engineer_model, 0.15),

    # ── AI Sub-Team ─────────────────────────────────────────────────────────
    _spec("ai_platform_engineer", ["AIPlatformEngineer"], 5, ["ai-team","vllm","gateway"], "ai_platform_engineer", settings.ai_platform_engineer_model, 0.1),
    _spec("prompt_engineer", ["PromptEngineer"], 5, ["ai-team","prompts","eval"], "prompt_engineer", settings.prompt_engineer_model, 0.2),
    _spec("ml_engineer", ["MLEngineer"], 5, ["ai-team","ml","fine-tuning"], "ml_engineer", settings.ml_engineer_model, 0.15),
    _spec("llmops_engineer", ["LLMOpsEngineer"], 5, ["ai-team","llmops","monitoring"], "llmops_engineer", settings.llmops_engineer_model, 0.1),
    _spec("ai_integration_engineer", ["AIIntegrationEngineer"], 5, ["ai-team","sdk","integration"], "ai_integration_engineer", settings.ai_integration_engineer_model, 0.15),

    # ── Security Sub-Team ───────────────────────────────────────────────────
    _spec("appsec_engineer", ["AppSecEngineer"], 5, ["security-team","appsec","owasp"], "appsec_engineer", settings.appsec_engineer_model, 0.05),
    _spec("cloud_security_engineer", ["CloudSecurityEngineer"], 5, ["security-team","cloud","cspm"], "cloud_security_engineer", settings.cloud_security_engineer_model, 0.05),
    _spec("devsecops_engineer", ["DevSecOpsEngineer"], 5, ["security-team","devsecops","cicd"], "devsecops_engineer", settings.devsecops_engineer_model, 0.1),
    _spec("identity_engineer", ["IdentityEngineer"], 3, ["security-team","iam","zero-trust"], "identity_engineer", settings.identity_engineer_model, 0.05),
    _spec("compliance_specialist", ["ComplianceSpecialist"], 3, ["security-team","compliance","soc2"], "compliance_specialist", settings.compliance_specialist_model, 0.05),
    _spec("security_operations_engineer", ["SecurityOperationsEngineer"], 5, ["security-team","secops","siem"], "security_operations_engineer", settings.security_operations_engineer_model, 0.1),

    # ── QA Sub-Team ─────────────────────────────────────────────────────────
    _spec("qa_automation_engineer", ["QAAutomationEngineer"], 5, ["qa-team","automation","playwright"], "qa_automation_engineer", settings.qa_automation_engineer_model, 0.1),
    _spec("performance_test_engineer", ["PerformanceTestEngineer"], 5, ["qa-team","performance","k6"], "performance_test_engineer", settings.performance_test_engineer_model, 0.1),
    _spec("manual_test_engineer", ["ManualTestEngineer"], 5, ["qa-team","manual","uat"], "manual_test_engineer", settings.manual_test_engineer_model, 0.15),
    _spec("accessibility_specialist", ["AccessibilitySpecialist"], 3, ["qa-team","a11y","wcag"], "accessibility_specialist", settings.accessibility_specialist_model, 0.1),
    _spec("ai_evaluation_specialist", ["AIEvaluationSpecialist"], 5, ["qa-team","ai-eval","ragas"], "ai_evaluation_specialist", settings.ai_evaluation_specialist_model, 0.15),

    # ── Marketing Sub-Team ──────────────────────────────────────────────────
    _spec("content_strategist", ["ContentStrategist"], 3, ["marketing-team","content","seo"], "content_strategist", settings.content_strategist_model, 0.4),
    _spec("seo_specialist", ["SEOSpecialist"], 3, ["marketing-team","seo","organic"], "seo_specialist", settings.seo_specialist_model, 0.1),
    _spec("growth_marketer", ["GrowthMarketer"], 3, ["marketing-team","growth","demand-gen"], "growth_marketer", settings.growth_marketer_model, 0.35),
    _spec("social_media_manager", ["SocialMediaManager"], 3, ["marketing-team","social","brand"], "social_media_manager", settings.social_media_manager_model, 0.45),
    _spec("devrel_engineer", ["DevRelEngineer"], 3, ["marketing-team","devrel","community"], "devrel_engineer", settings.devrel_engineer_model, 0.35),
    _spec("community_manager", ["CommunityManager"], 3, ["marketing-team","community","discord"], "community_manager", settings.community_manager_model, 0.4),
    _spec("pr_specialist", ["PRSpecialist"], 3, ["marketing-team","pr","media"], "pr_specialist", settings.pr_specialist_model, 0.4),
    _spec("campaign_manager", ["CampaignManager"], 3, ["marketing-team","campaigns","abm"], "campaign_manager", settings.campaign_manager_model, 0.3),
    _spec("graphic_designer", ["GraphicDesigner"], 3, ["marketing-team","design","brand"], "graphic_designer", settings.graphic_designer_model, 0.3),

    # ── Documentation Sub-Team ──────────────────────────────────────────────
    _spec("documentation_specialist", ["DocumentationSpecialist"], 3, ["docs-team","user-docs","kb"], "documentation_specialist", settings.documentation_specialist_model, 0.15),
    _spec("api_documentation_writer", ["APIDocumentationWriter"], 3, ["docs-team","api-docs","openapi"], "api_documentation_writer", settings.api_documentation_writer_model, 0.15),

    # ── Legacy / Original Agents ────────────────────────────────────────────
    {"name": "orchestrator", "version": settings.agent_version, "owner": settings.agent_owner, "capabilities": ["Planning"], "concurrency": settings.agent_concurrency, "endpoint": settings.agent_runner_endpoint, "tags": ["core","planner"], "metadata": {"agentType": "orchestrator", "model": settings.orchestrator_model}},
    {"name": "critic", "version": settings.agent_version, "owner": settings.agent_owner, "capabilities": ["Critique"], "concurrency": settings.agent_concurrency, "endpoint": settings.agent_runner_endpoint, "tags": ["core","evaluator"], "metadata": {"agentType": "critic", "model": settings.critic_model}},
    {"name": "coder", "version": settings.agent_version, "owner": settings.agent_owner, "capabilities": ["Coding"], "concurrency": settings.agent_concurrency, "endpoint": settings.agent_runner_endpoint, "tags": ["core","developer"], "metadata": {"agentType": "coder", "model": settings.coding_model}},
    {"name": "researcher", "version": settings.agent_version, "owner": settings.agent_owner, "capabilities": ["Research"], "concurrency": settings.agent_concurrency, "endpoint": settings.agent_runner_endpoint, "tags": ["core","researcher"], "metadata": {"agentType": "researcher", "model": settings.research_model}},
]

_registered_agent_ids: dict[str, str] = {}


async def register_all() -> None:
    base = settings.swarm_api_url.rstrip("/")
    url = f"{base}/api/v1/swarm/agents"
    async with httpx.AsyncClient(timeout=30.0) as client:
        for spec in AGENT_SPECS:
            name = spec["name"]
            attempts = 0
            while True:
                attempts += 1
                try:
                    resp = await client.post(url, json=spec)
                    if resp.status_code in (200, 201):
                        _registered_agent_ids[name] = resp.json().get("id", "unknown")
                        log.info("agent.registered", name=name)
                        break
                    elif resp.status_code == 409:
                        log.info("agent.already_registered", name=name)
                        break
                    else:
                        log.warning("agent.register_failed", name=name, status=resp.status_code, attempt=attempts)
                except (httpx.ConnectError, httpx.TimeoutException) as exc:
                    log.warning("agent.register_error", name=name, error=str(exc), attempt=attempts)
                if attempts >= 10:
                    log.error("agent.register_giving_up", name=name)
                    break
                await asyncio.sleep(min(2.0 * attempts, 15.0))


async def heartbeat_loop() -> None:
    base = settings.swarm_api_url.rstrip("/")
    interval = settings.heartbeat_interval_seconds
    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(interval)
            for name, agent_id in list(_registered_agent_ids.items()):
                url = f"{base}/api/v1/swarm/agents/{agent_id}/heartbeat"
                try:
                    await client.patch(url, json={"health": "healthy", "activeRuns": 0})
                except Exception as exc:
                    log.warning("heartbeat.failed", name=name, error=str(exc))
