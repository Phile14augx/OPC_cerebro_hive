import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class MemoryItem(Base):
    """A single memory record. `tier` selects which of the six memory types
    (per the spec) this belongs to; embeddings are stored as JSON float lists
    so this runs on SQLite — swap for pgvector in production for real ANN
    search at scale.
    """

    __tablename__ = "memory_items"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    agent_id: Mapped[str] = mapped_column(String, index=True)
    run_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    # working | short_term | long_term | semantic | episodic | procedural
    tier: Mapped[str] = mapped_column(String, index=True)

    content: Mapped[str] = mapped_column(String)
    embedding: Mapped[list] = mapped_column(JSON, default=list)
    meta: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
