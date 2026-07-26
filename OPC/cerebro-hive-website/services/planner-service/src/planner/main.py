"""HiveSwarm Planner Service — FastAPI application."""
from __future__ import annotations

import asyncio
import time
from contextlib import asynccontextmanager
from typing import Any

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .graph import get_compiled_graph, run_planner
from .models import PlanRequest, PlanResponse

log = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):  # type: ignore[type-arg]
    log.info("planner.startup", provider=settings.ai_provider, model=(
        settings.anthropic_model if settings.ai_provider == "anthropic" else settings.openai_model
    ))
    # Prime the singleton graph at startup — avoids cold-start on first request
    get_compiled_graph()
    yield
    log.info("planner.shutdown")


app = FastAPI(
    title="HiveSwarm Planner Service",
    version="0.1.0",
    description="Decomposes natural-language goals into TaskDAGs via LLM reasoning.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "planner-service"}


@app.get("/readyz", tags=["ops"])
async def readyz() -> dict[str, str]:
    from .graph import _compiled_graph  # module-level singleton
    if _compiled_graph is None:
        raise HTTPException(status_code=503, detail="graph not compiled")
    return {"status": "ready"}


# ── Plan ───────────────────────────────────────────────────────────────────────

@app.post(
    "/plan",
    response_model=PlanResponse,
    status_code=status.HTTP_200_OK,
    tags=["planner"],
    summary="Decompose a goal into a TaskDAG",
)
async def plan(req: PlanRequest) -> PlanResponse:
    """Accept a natural-language goal and return a TaskDAG.

    The DAG is ready to be POSTed to swarm-api's `/api/v1/runs` endpoint.
    """
    t0 = time.monotonic()
    log.info(
        "planner.plan.start",
        tenant_id=req.tenant_id,
        user_id=req.user_id,
        goal_len=len(req.goal),
    )
    try:
        response = await asyncio.wait_for(
            run_planner(
                goal=req.goal,
                context=req.context,
                constraints=req.constraints,
                tenant_id=req.tenant_id,
                user_id=req.user_id,
                llm=None,  # uses globally-compiled graph
            ),
            timeout=settings.planner_timeout_seconds,
        )
    except asyncio.TimeoutError:
        log.error("planner.plan.timeout", goal=req.goal[:80])
        raise HTTPException(status_code=504, detail="Planner timed out")
    except Exception as exc:
        log.exception("planner.plan.error", exc=str(exc))
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    elapsed = time.monotonic() - t0
    log.info(
        "planner.plan.done",
        dag_id=response.dag.id,
        nodes=len(response.dag.nodes),
        confidence=response.confidence,
        elapsed_ms=round(elapsed * 1000),
        tokens=response.llm_tokens_used,
    )
    return response


# ── Request logging middleware ─────────────────────────────────────────────────

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


if __name__ == "__main__":
    uvicorn.run("planner.main:app", host="0.0.0.0", port=settings.port, reload=False)
