"""HiveSwarm Agent Runner — FastAPI entry point.

Hosts all 4 concrete agents (Orchestrator, Critic, Coder, Researcher) behind
a single HTTP service. The worker pool dispatcher calls POST /execute; the
capability field in the request body determines which agent handles it.

Architecture:
  POST /execute        → dispatch by capability
  GET  /health         → liveness probe
  GET  /readyz         → readiness (swarm-api must be reachable)
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
from .coding import CodingAgent
from .config import settings
from .critic import CriticAgent
from .llm import build_llm
from .orchestrator import OrchestratorAgent
from .registry import heartbeat_loop, register_all
from .research import ResearchAgent

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.dev.ConsoleRenderer(),
    ],
)
log = structlog.get_logger(__name__)

# ── Agent registry ────────────────────────────────────────────────────────────

def _build_agents() -> dict[str, BaseHiveAgent]:
    """Construct all agent instances with their configured LLMs."""
    api_key = settings.anthropic_api_key
    provider = settings.ai_provider if api_key else "mock"
    max_tokens = settings.max_tokens
    temp = settings.temperature

    agents: dict[str, BaseHiveAgent] = {}

    for cls, model_attr in [
        (OrchestratorAgent, "orchestrator_model"),
        (CriticAgent, "critic_model"),
        (CodingAgent, "coding_model"),
        (ResearchAgent, "research_model"),
    ]:
        model = getattr(settings, model_attr)
        llm = build_llm(provider, model, api_key, max_tokens, temp)
        instance = cls(llm=llm)
        # Register by capability — allows one agent per capability
        agents[instance.capability] = instance
        log.info("agent.built", name=instance.name, capability=instance.capability, provider=provider, model=model)

    return agents


_agents: dict[str, BaseHiveAgent] = {}

# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _agents
    _agents = _build_agents()
    log.info("agent_runner.startup", agent_count=len(_agents), provider=settings.ai_provider)

    # Register with swarm-api in background (non-blocking)
    asyncio.create_task(register_all())
    asyncio.create_task(heartbeat_loop())

    yield

    log.info("agent_runner.shutdown")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="HiveSwarm Agent Runner",
    version="0.1.0",
    description="Hosts Orchestrator, Critic, Coder, and Research agents.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "agent-runner",
        "agents": list(_agents.keys()),
        "timestamp": time.time(),
    }


@app.get("/readyz", tags=["ops"])
async def readyz() -> dict[str, Any]:
    if not _agents:
        raise HTTPException(status_code=503, detail="agents not initialized")
    return {"status": "ready", "agents": list(_agents.keys())}


# ── Execute ───────────────────────────────────────────────────────────────────

@app.post("/execute", tags=["execution"])
async def execute(request: Request) -> JSONResponse:
    """
    Dispatch a task to the appropriate agent based on the capability field.

    Expected payload from swarm-runtime worker pool:
    {
      "taskId":     "uuid",
      "runId":      "uuid",
      "capability": "Planning|Critique|Coding|Research",
      "priority":   "normal|high|critical|low",
      "input": {
        "objective": "natural language task description",
        ...
      }
    }

    Response:
    {
      "success": bool,
      "output":  { ... },
      "error":   "string if failed",
      "tokensUsed": int,
      "costUsd":    float
    }
    """
    data: dict[str, Any] = await request.json()
    req = ExecuteRequest(data)

    log.info(
        "execute.received",
        task_id=req.task_id,
        capability=req.capability,
        objective=req.objective[:80] if req.objective else "",
    )

    agent = _agents.get(req.capability)
    if agent is None:
        # Try case-insensitive match
        for cap, a in _agents.items():
            if cap.lower() == req.capability.lower():
                agent = a
                break

    if agent is None:
        available = list(_agents.keys())
        log.warning("execute.no_agent", capability=req.capability, available=available)
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "output": {},
                "error": f"No agent for capability '{req.capability}'. Available: {available}",
                "tokensUsed": 0,
                "costUsd": 0.0,
            },
        )

    # Run agent synchronously (agents are CPU-bound on LLM calls)
    # In production: use a thread pool to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(None, agent.run, req)

    log.info(
        "execute.done",
        task_id=req.task_id,
        capability=req.capability,
        success=response.success,
    )

    status_code = 200 if response.success else 422
    return JSONResponse(status_code=status_code, content=response.to_dict())


# ── Request logging ───────────────────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next: Any) -> Any:
    t0 = time.monotonic()
    response = await call_next(request)
    log.info(
        "http.request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        ms=round((time.monotonic() - t0) * 1000),
    )
    return response


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    uvicorn.run(
        "agent_runner.main:app",
        host=settings.host,
        port=settings.port,
        log_level=settings.log_level,
        reload=False,
    )


if __name__ == "__main__":
    main()
