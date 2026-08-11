import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class AgentTemplate(Base):
    """The Agent Store: one-click-installable agent templates, loaded from
    agents_store/*.yaml at seed time and installable via POST
    /marketplace/install/{slug}.
    """

    __tablename__ = "agent_templates"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String, default="")
    definition: Mapped[dict] = mapped_column(JSON, default=dict)
    rating: Mapped[float] = mapped_column(default=5.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class Installation(Base):
    __tablename__ = "installations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    template_slug: Mapped[str] = mapped_column(String, index=True)
    agent_id: Mapped[str] = mapped_column(String, index=True)
    installed_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
