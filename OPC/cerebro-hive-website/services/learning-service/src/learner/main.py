"""HiveSwarm Learning Service — FastAPI application."""
from __future__ import annotations

import time
from contextlib import asynccontextmanager
from typing import Any

import asyncpg
import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import (
    AgentBenchmark,
    OptimizeRequest,
    OptimizeResponse,
    ReplayRecord,
    StoreReplayResponse,
)
from .optimizer import optimize_prompt
from .store import compute_benchmark, ensure_schema, get_replays, store_replay

log = structlog.get_logger(__name__)

_pool: asyncpg.Pool | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):  # type: ignore[type-arg]
    global _pool
    log.info("learner.startup")
    _pool = await asyncpg.create_pool(settings.database_url, min_size=2, max_size=10)
    async with _pool.acquire() as conn:
        await ensure_schema(conn)
    log.info("learner.ready", db="postgres")
    yield
    if _pool:
        await _pool.close()
    log.info("learner.shutdown")


app = FastAPI(
    title="HiveSwarm Learning Service",
    version="0.1.0",
    description="Stores execution replays, computes benchmarks, and optimises agent prompts.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _require_pool() -> asyncpg.Pool:
    if _pool is None:
        raise HTTPException(status_code=503, detail="database not ready")
    return _pool


# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["ops"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "learning-service"}


# ── Replay ─────────────────────────────────────────────────────────────────────

@app.post(
    "/replay/store",
    response_model=StoreReplayResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["replay"],
    summary="Store a task execution replay",
)
async def store(replay: ReplayRecord) -> StoreReplayResponse:
    pool = _require_pool()
    replay_id = await store_replay(pool, replay)
    log.info("replay.stored", id=replay_id, agent=replay.agent_id, score=replay.quality_score)
    return StoreReplayResponse(id=replay_id)


@app.get(
    "/replay/{agent_id}",
    response_model=list[ReplayRecord],
    tags=["replay"],
    summary="List replays for an agent",
)
async def list_replays(agent_id: str, capability: str = "", limit: int = 50) -> list[Any]:
    pool = _require_pool()
    rows = await get_replays(pool, agent_id, capability or "%", limit)
    return rows


# ── Benchmarks ─────────────────────────────────────────────────────────────────

@app.get(
    "/benchmarks/{agent_id}",
    response_model=AgentBenchmark,
    tags=["benchmarks"],
    summary="Get performance benchmarks for an agent",
)
async def benchmarks(agent_id: str, capability: str) -> AgentBenchmark:
    pool = _require_pool()
    result = await compute_benchmark(pool, agent_id, capability, settings.benchmark_window)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No replays found for agent {agent_id!r} capability {capability!r}",
        )
    return result


# ── Optimisation ───────────────────────────────────────────────────────────────

@app.post(
    "/optimize",
    response_model=OptimizeResponse,
    tags=["optimize"],
    summary="Optimise an agent's system prompt using replay history",
)
async def optimize(req: OptimizeRequest) -> OptimizeResponse:
    pool = _require_pool()
    replays = await get_replays(pool, req.agent_id, req.capability, req.sample_size)

    if len(replays) < settings.min_replays_for_optimization:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Insufficient replays: need {settings.min_replays_for_optimization}, "
                f"have {len(replays)} for agent {req.agent_id!r} / {req.capability!r}"
            ),
        )

    t0 = time.monotonic()
    result = await optimize_prompt(req, replays)
    log.info(
        "optimize.done",
        agent_id=req.agent_id,
        replays=len(replays),
        delta=result.expected_score_delta,
        ms=round((time.monotonic() - t0) * 1000),
    )
    return result


# ── Request logging ────────────────────────────────────────────────────────────

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
    uvicorn.run("learner.main:app", host="0.0.0.0", port=settings.port, reload=False)
