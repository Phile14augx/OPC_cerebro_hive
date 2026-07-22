import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Run(Base):
    """One invocation of the Agent Runtime against a goal.

    This is the execution record the whole kernel loop (planner → scheduler →
    agent → tool/LLM → evaluator → result) hangs off of.
    """

    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    agent_id: Mapped[str] = mapped_column(String, index=True)
    goal: Mapped[str] = mapped_column(String)

    # idle | thinking | planning | executing | waiting | calling_tool | reflecting
    # | completed | failed | pending_approval
    status: Mapped[str] = mapped_column(String, default="idle")

    plan: Mapped[list] = mapped_column(JSON, default=list)
    steps_completed: Mapped[list] = mapped_column(JSON, default=list)
    result: Mapped[str | None] = mapped_column(String, nullable=True)
    error: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)


class WorkflowRun(Base):
    """An execution of a Workflow Engine DAG (distinct from a single-agent Run —
    a workflow can fan out across several agents and tool/approval nodes)."""

    __tablename__ = "workflow_runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    workflow_name: Mapped[str] = mapped_column(String)
    definition: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String, default="running")  # running|completed|failed|paused
    node_states: Mapped[dict] = mapped_column(JSON, default=dict)
    context: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)
