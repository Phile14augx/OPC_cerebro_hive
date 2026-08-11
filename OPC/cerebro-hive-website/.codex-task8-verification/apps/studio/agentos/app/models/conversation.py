import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Conversation(Base):
    """A high-level conversational session with a user."""

    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    title: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    threads = relationship("Thread", back_populates="conversation")


class Thread(Base):
    """A thread within a conversation, typically tied to a specific agent execution context."""

    __tablename__ = "threads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    conversation_id: Mapped[str] = mapped_column(String, ForeignKey("conversations.id"), index=True)
    agent_id: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_now, onupdate=_now)

    conversation = relationship("Conversation", back_populates="threads")
    messages = relationship("Message", back_populates="thread")


class Message(Base):
    """An individual message in a thread."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    thread_id: Mapped[str] = mapped_column(String, ForeignKey("threads.id"), index=True)
    role: Mapped[str] = mapped_column(String)  # user, assistant, system, tool
    content: Mapped[str] = mapped_column(Text)
    
    # Metadata for storing tool call IDs, reasoning traces, or UI hints
    meta_data: Mapped[dict] = mapped_column(JSON, default=dict)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    thread = relationship("Thread", back_populates="messages")


class Artifact(Base):
    """A distinct output generated during a run (e.g., a report, code file, dataset)."""

    __tablename__ = "artifacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    run_id: Mapped[str] = mapped_column(String, index=True)
    agent_id: Mapped[str] = mapped_column(String, index=True)
    
    title: Mapped[str] = mapped_column(String)
    artifact_type: Mapped[str] = mapped_column(String) # code, text, json, image
    content: Mapped[str] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
