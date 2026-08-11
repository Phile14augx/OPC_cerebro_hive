import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Agent(Base):
    """The Agent Registry: every agent exists as a first-class entity with an
    identity, capability list, permissions, and lifecycle state — not a
    hardcoded script.
    """

    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, default="")
    version: Mapped[str] = mapped_column(String, default="1.0.0")
    owner: Mapped[str] = mapped_column(String, default="system")

    capabilities: Mapped[list] = mapped_column(JSON, default=list)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict)
    tools: Mapped[list] = mapped_column(JSON, default=list)
    skills: Mapped[list] = mapped_column(JSON, default=list)

    llm_provider: Mapped[str] = mapped_column(String, default="mock")
    llm_model: Mapped[str] = mapped_column(String, default="mock-1")
    temperature: Mapped[float] = mapped_column(Float, default=0.3)
    reasoning_profile: Mapped[str] = mapped_column(String, default="chain_of_thought")
    memory_profile: Mapped[str] = mapped_column(String, default="standard")
    deployment_target: Mapped[str] = mapped_column(String, default="local")

    # idle | thinking | planning | executing | waiting | calling_tool | reflecting
    # | learning | completed | failed
    lifecycle_state: Mapped[str] = mapped_column(String, default="idle")
    status: Mapped[str] = mapped_column(String, default="active")  # active | disabled

    category: Mapped[str] = mapped_column(String, default="general")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)
