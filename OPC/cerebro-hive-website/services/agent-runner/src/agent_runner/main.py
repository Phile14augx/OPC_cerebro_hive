"""HiveSwarm Agent Runner — FastAPI entry point.

Hosts all CerebroHive EIOS agents behind a single HTTP service.
The capability field in the request body determines which agent handles it.
"""
from __future__ import annotations

import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .base_agent import BaseHiveAgent, ExecuteRequest
from .config import settings
from .llm import build_llm
from .registry import heartbeat_loop, register_all

# ── Strategic Core ────────────────────────────────────────────────────────────
from .ceo import CeoAgent
from .enterprise_architect import EnterpriseArchitectAgent
from .project_manager import ProjectManagerAgent
from .solution_architect import SolutionArchitectAgent
from .technical_lead import TechnicalLeadAgent
from .product_manager import ProductManagerAgent
from .sales_strategist import SalesStrategistAgent
from .customer_success_manager import CustomerSuccessManagerAgent

# ── Engineering Specialists ───────────────────────────────────────────────────
from .backend_engineer import BackendEngineerAgent
from .frontend_engineer import FrontendEngineerAgent
from .devops_sre import DevOpsSREAgent
from .ai_engineer import AIEngineerAgent
from .qa_engineer import QAEngineerAgent
from .security_architect import SecurityArchitectAgent
from .technical_writer import TechnicalWriterAgent
from .marketing_strategist import MarketingStrategistAgent
from .research_scientist import ResearchScientistAgent
from .ux_designer import UXDesignerAgent
from .data_engineer import DataEngineerAgent
from .platform_engineer import PlatformEngineerAgent
from .integration_engineer import IntegrationEngineerAgent

# ── AI Sub-Team ───────────────────────────────────────────────────────────────
from .ai_platform_engineer import AIPlatformEngineerAgent
from .prompt_engineer import PromptEngineerAgent
from .ml_engineer import MLEngineerAgent
from .llmops_engineer import LLMOpsEngineerAgent
from .ai_integration_engineer import AIIntegrationEngineerAgent

# ── Security Sub-Team ─────────────────────────────────────────────────────────
from .appsec_engineer import AppSecEngineerAgent
from .cloud_security_engineer import CloudSecurityEngineerAgent
from .devsecops_engineer import DevSecOpsEngineerAgent
from .identity_engineer import IdentityEngineerAgent
from .compliance_specialist import ComplianceSpecialistAgent
from .security_operations_engineer import SecurityOperationsEngineerAgent

# ── QA Sub-Team ───────────────────────────────────────────────────────────────
from .qa_automation_engineer import QAAutomationEngineerAgent
from .performance_test_engineer import PerformanceTestEngineerAgent
from .manual_test_engineer import ManualTestEngineerAgent
from .accessibility_specialist import AccessibilitySpecialistAgent
from .ai_evaluation_specialist import AIEvaluationSpecialistAgent

# ── Marketing Sub-Team ────────────────────────────────────────────────────────
from .content_strategist import ContentStrategistAgent
from .seo_specialist import SEOSpecialistAgent
from .growth_marketer import GrowthMarketerAgent
from .social_media_manager import SocialMediaManagerAgent
from .devrel_engineer import DevRelEngineerAgent
from .community_manager import CommunityManagerAgent
from .pr_specialist import PRSpecialistAgent
from .campaign_manager import CampaignManagerAgent
from .graphic_designer import GraphicDesignerAgent

# ── Documentation Sub-Team ────────────────────────────────────────────────────
from .documentation_specialist import DocumentationSpecialistAgent
from .api_documentation_writer import APIDocumentationWriterAgent

# ── Legacy / Original Agents ──────────────────────────────────────────────────
from .orchestrator import OrchestratorAgent
from .critic import CriticAgent
from .coding import CodingAgent
from .research import ResearchAgent

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ],
)
log = structlog.get_logger(__name__)


def _build_agents() -> dict[str, BaseHiveAgent]:
    api_key = settings.anthropic_api_key
    provider = settings.ai_provider if api_key else "mock"
    max_tokens = settings.max_tokens
    temp = settings.temperature

    agents: dict[str, BaseHiveAgent] = {}

    for cls, model_attr in [
        # Strategic Core
        (CeoAgent, "ceo_model"),
        (EnterpriseArchitectAgent, "enterprise_architect_model"),
        (ProjectManagerAgent, "project_manager_model"),
        (SolutionArchitectAgent, "solution_architect_model"),
        (TechnicalLeadAgent, "technical_lead_model"),
        (ProductManagerAgent, "product_manager_model"),
        (SalesStrategistAgent, "sales_strategist_model"),
        (CustomerSuccessManagerAgent, "customer_success_manager_model"),
        # Engineering Specialists
        (BackendEngineerAgent, "backend_engineer_model"),
        (FrontendEngineerAgent, "frontend_engineer_model"),
        (DevOpsSREAgent, "devops_sre_model"),
        (AIEngineerAgent, "ai_engineer_model"),
        (QAEngineerAgent, "qa_engineer_model"),
        (SecurityArchitectAgent, "security_architect_model"),
        (TechnicalWriterAgent, "technical_writer_model"),
        (MarketingStrategistAgent, "marketing_strategist_model"),
        (ResearchScientistAgent, "research_scientist_model"),
        (UXDesignerAgent, "ux_designer_model"),
        (DataEngineerAgent, "data_engineer_model"),
        (PlatformEngineerAgent, "platform_engineer_model"),
        (IntegrationEngineerAgent, "integration_engineer_model"),
        # AI Sub-Team
        (AIPlatformEngineerAgent, "ai_platform_engineer_model"),
        (PromptEngineerAgent, "prompt_engineer_model"),
        (MLEngineerAgent, "ml_engineer_model"),
        (LLMOpsEngineerAgent, "llmops_engineer_model"),
        (AIIntegrationEngineerAgent, "ai_integration_engineer_model"),
        # Security Sub-Team
        (AppSecEngineerAgent, "appsec_engineer_model"),
        (CloudSecurityEngineerAgent, "cloud_security_engineer_model"),
        (DevSecOpsEngineerAgent, "devsecops_engineer_model"),
        (IdentityEngineerAgent, "identity_engineer_model"),
        (ComplianceSpecialistAgent, "compliance_specialist_model"),
        (SecurityOperationsEngineerAgent, "security_operations_engineer_model"),
        # QA Sub-Team
        (QAAutomationEngineerAgent, "qa_automation_engineer_model"),
        (PerformanceTestEngineerAgent, "performance_test_engineer_model"),
        (ManualTestEngineerAgent, "manual_test_engineer_model"),
        (AccessibilitySpecialistAgent, "accessibility_specialist_model"),
        (AIEvaluationSpecialistAgent, "ai_evaluation_specialist_model"),
        # Marketing Sub-Team
        (ContentStrategistAgent, "content_strategist_model"),
        (SEOSpecialistAgent, "seo_specialist_model"),
        (GrowthMarketerAgent, "growth_marketer_model"),
        (SocialMediaManagerAgent, "social_media_manager_model"),
        (DevRelEngineerAgent, "devrel_engineer_model"),
        (CommunityManagerAgent, "community_manager_model"),
        (PRSpecialistAgent, "pr_specialist_model"),
        (CampaignManagerAgent, "campaign_manager_model"),
        (GraphicDesignerAgent, "graphic_designer_model"),
        # Documentation Sub-Team
        (DocumentationSpecialistAgent, "documentation_specialist_model"),
        (APIDocumentationWriterAgent, "api_documentation_writer_model"),
        # Legacy
        (OrchestratorAgent, "orchestrator_model"),
        (CriticAgent, "critic_model"),
        (CodingAgent, "coding_model"),
        (ResearchAgent, "research_model"),
    ]:
        model = getattr(settings, model_attr)
        llm = build_llm(provider, model, api_key, max_tokens, temp)
        instance = cls(llm=llm)
        agents[instance.capability] = instance
        log.info("agent.built", name=instance.name, capability=instance.capability, model=model)

    return agents


_agents: dict[str, BaseHiveAgent] = {}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _agents
    _agents = _build_agents()
    log.info("agent_runner.startup", agent_count=len(_agents))
    asyncio.create_task(register_all())
    asyncio.create_task(heartbeat_loop())
    yield
    log.info("agent_runner.shutdown")


app = FastAPI(
    title="HiveSwarm Agent Runner",
    version="0.2.0",
    description=(
        "CerebroHive EIOS — 52 agents across 8 functional teams: "
        "Strategic Core (8) | Engineering Specialists (13) | AI Sub-Team (5) | "
        "Security Sub-Team (6) | QA Sub-Team (5) | Marketing Sub-Team (9) | "
        "Documentation Sub-Team (2) | Legacy (4)"
    ),
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET", "POST"], allow_headers=["*"])


@app.get("/health", tags=["ops"])
async def health() -> dict[str, Any]:
    return {"status": "ok", "service": "agent-runner", "agents": list(_agents.keys()), "count": len(_agents), "timestamp": time.time()}


@app.get("/readyz", tags=["ops"])
async def readyz() -> dict[str, Any]:
    if not _agents:
        raise HTTPException(status_code=503, detail="agents not initialized")
    return {"status": "ready", "agents": list(_agents.keys()), "count": len(_agents)}


@app.post("/execute", tags=["execution"])
async def execute(request: Request) -> JSONResponse:
    data: dict[str, Any] = await request.json()
    req = ExecuteRequest(data)
    log.info("execute.received", task_id=req.task_id, capability=req.capability)

    agent = _agents.get(req.capability)
    if agent is None:
        for cap, a in _agents.items():
            if cap.lower() == req.capability.lower():
                agent = a
                break

    if agent is None:
        return JSONResponse(status_code=404, content={"success": False, "output": {}, "error": f"No agent for capability '{req.capability}'. Available: {list(_agents.keys())}", "tokensUsed": 0, "costUsd": 0.0})

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, agent.run, req)
    log.info("execute.done", task_id=req.task_id, capability=req.capability, success=response.success)
    return JSONResponse(status_code=200 if response.success else 422, content=response.to_dict())


@app.middleware("http")
async def log_requests(request: Request, call_next: Any) -> Any:
    t0 = time.monotonic()
    response = await call_next(request)
    log.info("http.request", method=request.method, path=request.url.path, status=response.status_code, ms=round((time.monotonic() - t0) * 1000))
    return response


def main() -> None:
    uvicorn.run("agent_runner.main:app", host=settings.host, port=settings.port, log_level=settings.log_level, reload=False)


if __name__ == "__main__":
    main()
