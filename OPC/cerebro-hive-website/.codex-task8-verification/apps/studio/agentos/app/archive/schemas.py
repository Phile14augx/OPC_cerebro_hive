"""CerebroArchive™ — Pydantic schemas for API serialization."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Document schemas
# ---------------------------------------------------------------------------

class DocumentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    content: str | None = None
    source_url: str | None = None
    domain: str = "general"
    resource_type: str = "document"
    tags: list[str] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
    is_public: bool = False
    org_id: str | None = None
    workspace_id: str | None = None


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = None
    description: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    meta: dict[str, Any] | None = None
    is_public: bool | None = None


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str | None
    workspace_id: str | None
    created_by: str | None
    title: str
    description: str | None
    content: str | None
    source_url: str | None
    file_path: str | None
    file_type: str | None
    file_size_bytes: int | None
    domain: str
    resource_type: str
    tags: list
    meta: dict
    status: str
    node_count: int
    is_public: bool
    version: int
    created_at: datetime
    updated_at: datetime


class DocumentList(BaseModel):
    items: list[DocumentOut]
    total: int
    page: int
    page_size: int


# ---------------------------------------------------------------------------
# Node schemas
# ---------------------------------------------------------------------------

class NodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    document_id: str | None
    type: str
    name: str
    content: str
    provenance: dict
    meta: dict
    created_at: datetime


# ---------------------------------------------------------------------------
# Prompt schemas
# ---------------------------------------------------------------------------

class PromptCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    description: str | None = None
    content: str = Field(min_length=1)
    variables: list[dict] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    category: str = "general"
    is_public: bool = False
    org_id: str | None = None


class PromptUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = None
    description: str | None = None
    content: str | None = None
    variables: list[dict] | None = None
    tags: list[str] | None = None
    category: str | None = None
    is_public: bool | None = None


class PromptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str | None
    name: str
    slug: str
    description: str | None
    content: str
    variables: list
    tags: list
    category: str
    version: int
    is_public: bool
    use_count: int
    avg_rating: float | None
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# ModelCard schemas
# ---------------------------------------------------------------------------

class ModelCardCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    provider: str
    model_id: str
    description: str | None = None
    capabilities: list[str] = Field(default_factory=list)
    context_window: int | None = None
    pricing: dict[str, Any] = Field(default_factory=dict)
    meta: dict[str, Any] = Field(default_factory=dict)
    org_id: str | None = None


class ModelCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str | None
    name: str
    slug: str
    provider: str
    model_id: str
    description: str | None
    capabilities: list
    context_window: int | None
    pricing: dict
    meta: dict
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Dataset schemas
# ---------------------------------------------------------------------------

class DatasetCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    description: str | None = None
    format: str = "jsonl"
    tags: list[str] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
    is_public: bool = False
    org_id: str | None = None


class DatasetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str | None
    name: str
    slug: str
    description: str | None
    format: str
    row_count: int | None
    file_path: str | None
    file_size_bytes: int | None
    tags: list
    meta: dict
    is_public: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Search schemas
# ---------------------------------------------------------------------------

class SearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(min_length=1, max_length=1000)
    domains: list[str] = Field(default_factory=list)     # filter by domain
    resource_types: list[str] = Field(default_factory=list)
    org_id: str | None = None
    workspace_id: str | None = None
    limit: int = Field(default=10, ge=1, le=100)
    keyword_weight: float = Field(default=0.4, ge=0.0, le=1.0)
    vector_weight: float = Field(default=0.6, ge=0.0, le=1.0)


class SearchResultOut(BaseModel):
    id: str
    title: str
    content_preview: str
    score: float
    domain: str
    resource_type: str
    metadata: dict
    highlights: list[str]


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultOut]
    total: int
    search_type: str  # "hybrid", "keyword", "vector"


# ---------------------------------------------------------------------------
# RAG schemas
# ---------------------------------------------------------------------------

class RAGRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(min_length=1, max_length=2000)
    org_id: str | None = None
    workspace_id: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)
    model: str = "default"
    include_sources: bool = True


class RAGResponse(BaseModel):
    answer: str
    sources: list[dict]
    model: str
    query: str
