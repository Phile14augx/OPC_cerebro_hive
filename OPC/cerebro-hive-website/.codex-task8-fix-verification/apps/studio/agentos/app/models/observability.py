import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class TraceSpan(Base):
    """A single span in a run's trace (planner/reasoner/retriever/memory/llm/
    tool/response). Shaped so it can be exported to OpenTelemetry/Jaeger
    directly in production instead of just stored here.
    """

    __tablename__ = "trace_spans"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)  # e.g. "planner", "llm_call", "tool:web_search"
    status: Mapped[str] = mapped_column(String, default="ok")  # ok|error
    attributes: Mapped[dict] = mapped_column(JSON, default=dict)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0)


class MetricEvent(Base):
    __tablename__ = "metric_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    run_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String)  # tokens|cost|latency_ms|failures|tool_calls
    value: Mapped[float] = mapped_column(Float, default=0.0)
    tags: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class EventLogEntry(Base):
    """Append-only event log (event sourcing): TaskStarted, TaskCompleted,
    MemoryUpdated, ToolUsed, AgentCreated, SkillInstalled, WorkflowFinished...
    """

    __tablename__ = "event_log"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    run_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
