"""Data Engineer skills — BaseTool subclasses."""
from __future__ import annotations

from typing import Any

try:
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:  # type: ignore[no-redef]
        def __init_subclass__(cls, **kwargs: Any) -> None: ...
    def Field(*a: Any, **kw: Any) -> Any: return None  # noqa: N802
    class BaseTool:  # type: ignore[no-redef]
        name: str = ""
        description: str = ""
        def _run(self, *a: Any, **kw: Any) -> str: return ""


class PipelineInput(BaseModel):
    source: str = Field(..., description="Data source system")
    destination: str = Field(..., description="Data destination system")
    mode: str = Field(default="streaming", description="Mode: streaming|batch")

class VectorInput(BaseModel):
    collection: str = Field(..., description="Vector collection/index name")
    embedding_model: str = Field(default="text-embedding-3-large", description="Embedding model")

class WarehouseInput(BaseModel):
    domain: str = Field(..., description="Data domain or subject area")
    grain: str = Field(default="daily", description="Data grain: realtime|hourly|daily")

class QualityInput(BaseModel):
    dataset: str = Field(..., description="Dataset or table to validate")
    rules: list[str] = Field(default_factory=list, description="Quality rules to apply")

class LineageInput(BaseModel):
    dataset: str = Field(..., description="Dataset to trace lineage for")

class RAGPipelineInput(BaseModel):
    source_type: str = Field(..., description="Document source: pdf|web|database|api")
    chunking_strategy: str = Field(default="semantic", description="Chunking: fixed|semantic|hierarchical")


class DataPipelineSkill(BaseTool):
    name: str = "data_pipeline"
    description: str = "Design and implement batch or streaming data pipelines."
    args_schema: type[BaseModel] = PipelineInput

    def _run(self, source: str, destination: str, mode: str = "streaming") -> str:
        return (
            f"Data pipeline: {source} → {destination} ({mode})\n"
            "Stack: Apache Flink (streaming) / Apache Spark (batch) + NATS JetStream\n"
            "Components: Schema validation | Transformation layer | "
            "Dead-letter queue | Backpressure handling | "
            "Idempotency keys | At-least-once delivery | Monitoring"
        )


class VectorDatabaseSkill(BaseTool):
    name: str = "vector_database"
    description: str = "Design and populate vector database collections for RAG workloads."
    args_schema: type[BaseModel] = VectorInput

    def _run(self, collection: str, embedding_model: str = "text-embedding-3-large") -> str:
        return (
            f"Vector collection: '{collection}' using {embedding_model}\n"
            "Platform: Qdrant (primary) + pgvector (fallback)\n"
            "Config: HNSW index (m=16, ef_construction=200) | "
            "Payload filtering | Sparse vector support (BM25) | "
            "Collection versioning | Incremental updates | "
            "Freshness SLA: ≤60s from ingest to searchable"
        )


class DataWarehouseSkill(BaseTool):
    name: str = "data_warehouse"
    description: str = "Design data warehouse schemas and dbt transformation models."
    args_schema: type[BaseModel] = WarehouseInput

    def _run(self, domain: str, grain: str = "daily") -> str:
        return (
            f"Data warehouse: '{domain}' domain ({grain} grain)\n"
            "Platform: Snowflake / ClickHouse (analytics)\n"
            "Approach: Dimensional modelling (star schema) | dbt models | "
            "Incremental materialisation | Data contracts | "
            "Automated freshness checks | Column-level access control"
        )


class DataQualitySkill(BaseTool):
    name: str = "data_quality"
    description: str = "Define and enforce data quality contracts and validation rules."
    args_schema: type[BaseModel] = QualityInput

    def _run(self, dataset: str, rules: list[str] = None) -> str:
        rule_list = rules or ["not_null", "unique", "accepted_values", "referential_integrity"]
        return (
            f"Data quality for '{dataset}':\n"
            f"Rules: {', '.join(rule_list)}\n"
            "Framework: Great Expectations + dbt tests\n"
            "Actions on failure: Alert → quarantine → DLQ → page on-call\n"
            "Reporting: Quality score dashboard (target ≥99.5%)"
        )


class DataLineageSkill(BaseTool):
    name: str = "data_lineage"
    description: str = "Document and track data lineage using OpenLineage."
    args_schema: type[BaseModel] = LineageInput

    def _run(self, dataset: str) -> str:
        return (
            f"Data lineage for '{dataset}':\n"
            "Platform: OpenLineage + Marquez\n"
            "Coverage: Source → Transform → Sink | Column-level lineage | "
            "Impact analysis | Upstream/downstream dependencies | "
            "GDPR data subject rights integration"
        )


class RAGDataPipelineSkill(BaseTool):
    name: str = "rag_data_pipeline"
    description: str = "Build end-to-end RAG data preparation pipelines."
    args_schema: type[BaseModel] = RAGPipelineInput

    def _run(self, source_type: str, chunking_strategy: str = "semantic") -> str:
        return (
            f"RAG pipeline: {source_type} → vector store ({chunking_strategy} chunking)\n"
            "Steps: Extraction → Cleaning → Metadata enrichment → "
            f"Chunking ({chunking_strategy}: preserve semantic boundaries) → "
            "Embedding (dense + sparse BM25) → Qdrant upsert → "
            "Quality validation → Freshness SLA monitoring"
        )


DATA_ENGINEER_SKILLS: list[BaseTool] = [
    DataPipelineSkill(),
    VectorDatabaseSkill(),
    DataWarehouseSkill(),
    DataQualitySkill(),
    DataLineageSkill(),
    RAGDataPipelineSkill(),
]
