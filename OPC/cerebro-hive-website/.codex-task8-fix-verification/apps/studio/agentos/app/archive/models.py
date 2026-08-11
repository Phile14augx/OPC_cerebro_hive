"""CerebroArchive™ — SQLAlchemy models.

All tables live in the `archive` schema on PostgreSQL.
On SQLite (tests) the schema is omitted so create_all() works without
requiring a running Postgres instance.

Data architecture:
  Document  — top-level unit (file, article, wiki page, etc.)
  Chunk     — semantic segment of a Document (for RAG)
  PromptTemplate — versioned prompt in the Prompt Library
  ModelCard — registered AI model (metadata + capabilities)
  Dataset   — registered dataset (for training, evals, or RAG)
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship as sa_relationship
from sqlalchemy.types import JSON

from app.db import Base

# Use named schema only on Postgres; SQLite doesn't support schemas.
_DB_URL = os.environ.get("DATABASE_URL", "sqlite")
_SCHEMA: str | None = "archive" if _DB_URL.startswith("postgresql") else None


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


# JSON column type that works on both Postgres (JSONB) and SQLite (JSON)
_JSON = JSONB if _DB_URL.startswith("postgresql") else JSON


class Document(Base):
    """A top-level knowledge asset stored in CerebroArchive."""

    __tablename__ = "archive_documents"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    org_id: Mapped[str | None] = mapped_column(String(36), index=True)
    workspace_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_by: Mapped[str | None] = mapped_column(String(36), index=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str | None] = mapped_column(Text)          # extracted plain text
    source_url: Mapped[str | None] = mapped_column(String(2000))
    file_path: Mapped[str | None] = mapped_column(String(2000)) # MinIO object key
    file_type: Mapped[str | None] = mapped_column(String(50))   # pdf, md, docx, url…
    file_size_bytes: Mapped[int | None] = mapped_column(Integer)

    # Taxonomy / classification
    domain: Mapped[str] = mapped_column(String(100), default="general", index=True)
    resource_type: Mapped[str] = mapped_column(String(100), default="document")
    tags: Mapped[list] = mapped_column(_JSON, default=list)
    meta: Mapped[dict] = mapped_column(_JSON, default=dict)

    # Processing state
    status: Mapped[str] = mapped_column(String(50), default="pending")
    # pending → processing → indexed → failed
    node_count: Mapped[int] = mapped_column(Integer, default=0)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)

    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_id: Mapped[str | None] = mapped_column(String(36), index=True)  # previous version

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    nodes: Mapped[list[Node]] = sa_relationship("app.archive.models.Node", back_populates="document", cascade="all, delete-orphan")


class Node(Base):
    """A generalized graph node (e.g., chunk, entity, policy) in the Knowledge Graph."""

    __tablename__ = "archive_nodes"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # Person, Organization, Policy, Project, Model, Workflow, chunk
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    
    document_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey(f"{'archive.' if _SCHEMA else ''}archive_documents.id", ondelete="CASCADE"),
        index=True,
    )
    org_id: Mapped[str | None] = mapped_column(String(36), index=True)

    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Versioning & Governance
    version: Mapped[int] = mapped_column(Integer, default=1)
    supersedes_id: Mapped[str | None] = mapped_column(String(36), index=True)
    status: Mapped[str] = mapped_column(String(50), default="Draft") # Draft, Validated, Approved, Deprecated, Archived
    created_by: Mapped[str | None] = mapped_column(String(100))
    modified_by: Mapped[str | None] = mapped_column(String(100))
    approved_by: Mapped[str | None] = mapped_column(String(100))
    
    # Temporal Knowledge
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Provenance metadata (Commit, API, Meeting, Slack, PDF, Human, etc.)
    provenance: Mapped[dict] = mapped_column(_JSON, default=dict)

    # Embedding stored as JSON array (pgvector stored separately in raw SQL for now)
    embedding: Mapped[list | None] = mapped_column(_JSON)

    meta: Mapped[dict] = mapped_column(_JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    document: Mapped[Document | None] = sa_relationship("app.archive.models.Document", back_populates="nodes")
    
    # Relationships for edges
    outgoing_edges: Mapped[list[Edge]] = sa_relationship(
        "app.archive.models.Edge", 
        foreign_keys="[app.archive.models.Edge.source_id]",
        back_populates="source",
        cascade="all, delete-orphan"
    )
    incoming_edges: Mapped[list[Edge]] = sa_relationship(
        "app.archive.models.Edge", 
        foreign_keys="[app.archive.models.Edge.target_id]",
        back_populates="target",
        cascade="all, delete-orphan"
    )

class Edge(Base):
    """A directed relationship between two nodes in the Knowledge Graph."""
    
    __tablename__ = "archive_edges"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    
    source_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(f"{'archive.' if _SCHEMA else ''}archive_nodes.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    target_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey(f"{'archive.' if _SCHEMA else ''}archive_nodes.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    
    relationship: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    
    # Temporal Knowledge
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Governance
    status: Mapped[str] = mapped_column(String(50), default="Draft") # Draft, Validated, Approved, Deprecated, Archived
    
    provenance: Mapped[dict] = mapped_column(_JSON, default=dict)
    meta: Mapped[dict] = mapped_column(_JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    
    source: Mapped[Node] = sa_relationship("app.archive.models.Node", foreign_keys="[Edge.source_id]", back_populates="outgoing_edges")
    target: Mapped[Node] = sa_relationship("app.archive.models.Node", foreign_keys="[Edge.target_id]", back_populates="incoming_edges")


class PromptTemplate(Base):
    """A versioned prompt in the Prompt Library."""

    __tablename__ = "archive_prompt_templates"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    org_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_by: Mapped[str | None] = mapped_column(String(36))

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, nullable=False)  # prompt text with {{variables}}

    # Variables declared in the prompt
    variables: Mapped[list] = mapped_column(_JSON, default=list)  # [{"name": "x", "description": "..."}]
    tags: Mapped[list] = mapped_column(_JSON, default=list)
    category: Mapped[str] = mapped_column(String(100), default="general")

    # Versioning
    version: Mapped[int] = mapped_column(Integer, default=1)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)

    # Quality signals
    use_count: Mapped[int] = mapped_column(Integer, default=0)
    avg_rating: Mapped[float | None] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class ModelCard(Base):
    """A registered AI model in the Model Registry."""

    __tablename__ = "archive_model_cards"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    org_id: Mapped[str | None] = mapped_column(String(36), index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(100))          # openai, anthropic, google, custom
    model_id: Mapped[str] = mapped_column(String(200))          # gpt-4o, claude-3-5-sonnet, etc.
    description: Mapped[str | None] = mapped_column(Text)
    capabilities: Mapped[list] = mapped_column(_JSON, default=list)  # ["chat", "vision", "code"]
    context_window: Mapped[int | None] = mapped_column(Integer)
    pricing: Mapped[dict] = mapped_column(_JSON, default=dict)  # {"input": 0.01, "output": 0.03} per 1k tokens
    meta: Mapped[dict] = mapped_column(_JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)


class Dataset(Base):
    """A registered dataset for training, evaluation, or RAG."""

    __tablename__ = "archive_datasets"
    __table_args__ = {"schema": _SCHEMA} if _SCHEMA else {}

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    org_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_by: Mapped[str | None] = mapped_column(String(36))

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
    format: Mapped[str] = mapped_column(String(50), default="jsonl")  # jsonl, csv, parquet
    row_count: Mapped[int | None] = mapped_column(Integer)
    file_path: Mapped[str | None] = mapped_column(String(2000))        # MinIO object key
    file_size_bytes: Mapped[int | None] = mapped_column(Integer)
    tags: Mapped[list] = mapped_column(_JSON, default=list)
    meta: Mapped[dict] = mapped_column(_JSON, default=dict)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)
