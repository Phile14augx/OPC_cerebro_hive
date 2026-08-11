"""HiveSwarm Evaluation Service — FastAPI application."""
from __future__ import annotations

import asyncio
import time
from typing import Any

import structlog
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .models import EvaluateRequest, EvaluateResponse
from .rubric import evaluate

log = structlog.get_logger(__name__)

app = FastAPI(
    title="HiveSwarm Evaluation Service",
    version="0.1.0",
    description="Scores agent task outputs for quality, relevance, and safety.",
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
    return {"status": "ok", "service": "evaluation-service"}


# ── Evaluate ───────────────────────────────────────────────────────────────────

@app.post(
    "/evaluate",
    response_model=EvaluateResponse,
    status_code=status.HTTP_200_OK,
    tags=["evaluator"],
    summary="Score a task output against the quality rubric",
)
async def evaluate_output(req: EvaluateRequest) -> EvaluateResponse:
    t0 = time.monotonic()
    log.info(
        "evaluator.evaluate.start",
        task_id=req.task_id,
        run_id=req.run_id,
        capability=req.task_capability,
    )
    try:
        result = await asyncio.wait_for(
            evaluate(req),
            timeout=settings.evaluator_timeout_seconds,
        )
    except asyncio.TimeoutError:
        log.error("evaluator.timeout", task_id=req.task_id)
        raise HTTPException(status_code=504, detail="Evaluator timed out")
    except Exception as exc:
        log.exception("evaluator.error", exc=str(exc))
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    elapsed = time.monotonic() - t0
    log.info(
        "evaluator.evaluate.done",
        task_id=req.task_id,
        score=result.composite_score,
        passed=result.passed,
        elapsed_ms=round(elapsed * 1000),
        tokens=result.llm_tokens_used,
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
    uvicorn.run("evaluator.main:app", host="0.0.0.0", port=settings.port, reload=False)
