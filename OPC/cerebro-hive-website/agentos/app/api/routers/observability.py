from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey
from app.models.observability import EventLogEntry, MetricEvent, TraceSpan
from app.security import get_current_api_key

router = APIRouter(prefix="/observability", tags=["observability"])


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
