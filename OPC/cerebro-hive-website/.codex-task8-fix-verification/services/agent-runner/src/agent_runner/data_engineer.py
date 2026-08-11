"""Data Engineer Agent — pipelines, vector stores, data quality, RAG infrastructure."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class DataEngineerAgent(BaseHiveAgent):
    """Senior Data Engineer & Enterprise Data Platform Lead."""

    name: str = "DataEngineer"
    capability: str = "DataEngineer"
    temperature: float = 0.1
    max_attempts: int = 15

    SYSTEM_PROMPT = """You are a Senior Data Engineer & Enterprise Data Platform Lead for CerebroHive EIOS.

ENGINEERING MANDATES:
- Every pipeline is idempotent, observable, and testable
- Data quality contracts are enforced before data reaches consumers
- Schema changes go through schema registry — no silent breaking changes
- All pipelines have dead-letter queues and alerting for failures
- GDPR compliance: data subjects can request deletion across all stores within 72h

PIPELINE STANDARDS:
- Streaming: Apache Flink + NATS JetStream (preferred over Kafka for CerebroHive)
- Batch: Apache Spark + dbt
- Delivery semantics: at-least-once with idempotency keys for exactly-once effect
- Backpressure: explicit flow control, no unbounded queues
- Monitoring: OpenTelemetry traces + Prometheus metrics + Grafana dashboards

VECTOR DATABASE STANDARDS (RAG Infrastructure):
- Primary: Qdrant with HNSW index (m=16, ef_construction=200)
- Fallback: pgvector for relational use cases
- Embeddings: dense (text-embedding-3-large) + sparse (BM25 via FastEmbed)
- Collection versioning: collections have semantic versions, never destructive updates
- Freshness SLA: ≤60 seconds from document ingest to searchable
- Payload: always store source_id, chunk_id, timestamp, document_hash for lineage

DATA QUALITY:
- Framework: Great Expectations + dbt tests
- Quality score target: ≥99.5% rows passing all contracts
- Failure action: alert → quarantine → DLQ → page on-call
- Data freshness alerts: automated staleness detection

LINEAGE & GOVERNANCE:
- OpenLineage (Marquez) for all pipelines
- Column-level lineage for sensitive data
- GDPR: PII tagged in data catalogue, deletion propagation automated"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Data engineering objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Design a data pipeline plan with JSON output:
{{
  "pipeline_type": "streaming|batch|micro-batch|hybrid",
  "source_systems": ["...", ...],
  "destination_systems": ["...", ...],
  "transformation_steps": ["...", ...],
  "schema": {{"input": {{}}, "output": {{}}}},
  "delivery_semantics": "at-least-once|exactly-once",
  "quality_contracts": ["...", ...],
  "pii_fields": ["...", ...],
  "lineage_tags": ["...", ...],
  "monitoring": {{"metrics": ["..."], "alerts": ["..."]}},
  "dlq_strategy": "...",
  "estimated_throughput": "X events/s",
  "sla": {{"latency_p99": "Xs", "availability": "99.9%"}}
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "pipeline_type": "streaming"}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Pipeline plan:
{json.dumps(plan, indent=2)}

Produce the complete implementation specification with JSON output:
{{
  "pipeline_spec": {{...}},
  "schema_definition": {{...}},
  "quality_contract_code": "...",
  "lineage_annotations": ["...", ...],
  "monitoring_config": {{...}},
  "deployment_ready": true/false,
  "validation_results": {{
    "idempotency": true/false,
    "dlq_configured": true/false,
    "quality_contracts_defined": true/false,
    "lineage_configured": true/false,
    "pii_tagged": true/false,
    "alerts_defined": true/false
  }},
  "estimated_latency_p99_ms": 0,
  "estimated_throughput_eps": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "deployment_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        validation = execution_result.get("validation_results", {})
        blockers = [k for k, v in validation.items() if not v]
        return {
            "deployment_ready": execution_result.get("deployment_ready", False),
            "blockers": blockers,
            "blocker_count": len(blockers),
            "latency_p99_ms": execution_result.get("estimated_latency_p99_ms", 0),
            "throughput_eps": execution_result.get("estimated_throughput_eps", 0),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        blockers = observations.get("blockers", [])
        if blockers:
            return (
                f"PIPELINE BLOCKED — {len(blockers)} requirement(s) not met: "
                f"{', '.join(blockers)}. Fix before deploying to production."
            )
        latency = observations.get("latency_p99_ms", 0)
        throughput = observations.get("throughput_eps", 0)
        return (
            f"Pipeline ready for deployment. "
            f"Estimated p99 latency: {latency}ms, "
            f"throughput: {throughput} events/s. "
            "Idempotency ✓ | DLQ ✓ | Quality contracts ✓ | Lineage ✓ | PII tagged ✓"
        )
