from datetime import datetime

import numpy as np
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.execution import Run
from app.models.identity import APIKey
from app.models.observability import EventLogEntry, MetricEvent, TraceSpan
from app.models.registry import Agent
from app.security import get_current_api_key

router = APIRouter(prefix="/observability", tags=["observability"])


def _percentile(data: list[float], p: float) -> float:
    if not data:
        return 0.0
    return float(np.percentile(data, p))


class TraceOut(BaseModel):
    id: str
    run_id: str
    name: str
    status: str
    attributes: dict
    started_at: datetime
    duration_ms: float

    class Config:
        from_attributes = True


class MetricOut(BaseModel):
    id: str
    run_id: str | None
    name: str
    value: float
    tags: dict
    created_at: datetime

    class Config:
        from_attributes = True


class EventOut(BaseModel):
    id: str
    run_id: str | None
    event_type: str
    payload: dict
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/traces", response_model=list[TraceOut])
def list_traces(run_id: str | None = None, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[TraceSpan]:
    query = db.query(TraceSpan)
    if run_id:
        query = query.filter(TraceSpan.run_id == run_id)
    return query.order_by(TraceSpan.started_at).all()


@router.get("/metrics", response_model=list[MetricOut])
def list_metrics(
    run_id: str | None = None,
    name: str | None = None,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> list[MetricEvent]:
    query = db.query(MetricEvent)
    if run_id:
        query = query.filter(MetricEvent.run_id == run_id)
    if name:
        query = query.filter(MetricEvent.name == name)
    return query.order_by(MetricEvent.created_at.desc()).limit(500).all()


@router.get("/events", response_model=list[EventOut])
def list_events(
    run_id: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> list[EventLogEntry]:
    query = db.query(EventLogEntry)
    if run_id:
        query = query.filter(EventLogEntry.run_id == run_id)
    if event_type:
        query = query.filter(EventLogEntry.event_type == event_type)
    return query.order_by(EventLogEntry.created_at.desc()).limit(500).all()


@router.get("/summary")
def observability_summary(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> dict:
    """The real aggregation the raw /traces, /metrics, /events listings never
    provided: latency percentiles, error rate, cost/token totals, and a
    per-agent latency rollup — all computed from stored spans/metrics/runs,
    not sampled or randomized."""
    spans = db.query(TraceSpan).all()
    durations = [s.duration_ms for s in spans]
    error_count = sum(1 for s in spans if s.status == "error")

    total_cost = sum(m.value for m in db.query(MetricEvent).filter(MetricEvent.name == "cost_usd").all())
    total_tokens = sum(m.value for m in db.query(MetricEvent).filter(MetricEvent.name == "tokens").all())

    runs = db.query(Run).all()
    status_counts: dict[str, int] = {}
    for r in runs:
        status_counts[r.status] = status_counts.get(r.status, 0) + 1

    run_to_agent = {r.id: r.agent_id for r in runs}
    agent_slugs = {a.id: a.slug for a in db.query(Agent).all()}

    per_agent_durations: dict[str, list[float]] = {}
    for s in spans:
        agent_id = run_to_agent.get(s.run_id)
        slug = agent_slugs.get(agent_id, agent_id or "unknown")
        per_agent_durations.setdefault(slug, []).append(s.duration_ms)

    per_agent = {
        slug: {
            "span_count": len(d),
            "p50_ms": round(_percentile(d, 50), 2),
            "p95_ms": round(_percentile(d, 95), 2),
        }
        for slug, d in per_agent_durations.items()
    }

    return {
        "span_count": len(spans),
        "error_count": error_count,
        "error_rate": round(error_count / len(spans), 4) if spans else 0.0,
        "latency_p50_ms": round(_percentile(durations, 50), 2),
        "latency_p95_ms": round(_percentile(durations, 95), 2),
        "latency_p99_ms": round(_percentile(durations, 99), 2),
        "total_cost_usd": round(total_cost, 4),
        "total_tokens": int(total_tokens),
        "total_runs": len(runs),
        "run_status_counts": status_counts,
        "per_agent": per_agent,
    }
