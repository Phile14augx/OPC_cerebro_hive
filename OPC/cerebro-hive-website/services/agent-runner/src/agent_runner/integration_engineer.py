"""Integration Engineer Agent — connectors, MCP servers, event-driven integration."""
from __future__ import annotations

import json
from typing import Any

from .base_agent import BaseHiveAgent, ExecuteRequest, ExecuteResponse


class IntegrationEngineerAgent(BaseHiveAgent):
    """Senior Integration Engineer & Enterprise Connectivity Lead."""

    name: str = "IntegrationEngineer"
    capability: str = "IntegrationEngineer"
    temperature: float = 0.15
    max_attempts: int = 12

    SYSTEM_PROMPT = """You are a Senior Integration Engineer & Enterprise Connectivity Lead for CerebroHive EIOS.

INTEGRATION MANDATE:
- Zero data loss is non-negotiable: every integration has retry + DLQ + idempotency
- Connectors are autonomous: they handle auth refresh, rate limits, and schema evolution
- Every integration is auditable: all operations logged with actor, timestamp, data hash
- MCP servers expose capabilities as typed tools with Zod/JSON Schema validation

CONNECTOR STANDARDS:
- Authentication: OAuth2 (PKCE for interactive, client credentials for M2M), API keys via Vault
- Retry: exponential backoff (1s, 2s, 4s, 8s, 16s), max 5 attempts
- DLQ: NATS JetStream DLQ stream with manual requeue capability
- Rate limiting: token bucket, per-destination, with 429 backoff respect
- Circuit breaker: 50% failure rate over 30s trips the circuit, 60s half-open
- Idempotency: idempotency key on all write operations
- Audit log: all operations (read+write) logged to central audit store

MCP SERVER STANDARDS:
- Language: TypeScript with official MCP SDK
- Tool schemas: Zod with strict validation
- Auth: JWT bearer via HiveSwarm gateway
- Error codes: typed errors with machine-readable codes
- Streaming: SSE for long-running operations
- Documentation: auto-generated from schema with examples

EVENT-DRIVEN INTEGRATION (NATS JetStream):
- Subject hierarchy: cerebro.{domain}.{entity}.{action}
- Consumer groups for competing consumer scaling
- Message TTL aligned to downstream SLA
- Schema registry: JSON Schema per subject, versioned
- Dead-letter subject: cerebro.dlq.{original_subject}

TESTING:
- Contract tests (Pact) for all consumer/provider pairs
- Integration tests against real sandbox APIs
- Chaos tests: network partition, auth expiry, rate limit, schema mismatch"""

    def plan(self, request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Integration objective: {request.objective}
Context: {json.dumps(request.context, indent=2)}

Design an integration plan with JSON output:
{{
  "integration_type": "connector|mcp_server|event_stream|api_gateway",
  "target_system": "...",
  "auth_method": "oauth2|api_key|mtls|jwt",
  "data_flow": "read|write|bidirectional|event",
  "endpoints": ["...", ...],
  "event_subjects": ["cerebro.domain.entity.action", ...],
  "retry_policy": {{"max_attempts": 5, "backoff": "exponential"}},
  "dlq_subject": "cerebro.dlq...",
  "idempotency_strategy": "...",
  "contract_tests": ["...", ...],
  "audit_log_fields": ["...", ...],
  "estimated_days": 0
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            return json.loads(raw[start:end])
        except Exception:
            return {"raw": raw, "integration_type": "connector"}

    def execute(self, plan: dict[str, Any], request: ExecuteRequest) -> dict[str, Any]:
        system = self.SYSTEM_PROMPT
        user = f"""Integration plan:
{json.dumps(plan, indent=2)}

Produce implementation specification with JSON output:
{{
  "integration_ready": true/false,
  "validation": {{
    "auth_configured": true/false,
    "retry_configured": true/false,
    "dlq_configured": true/false,
    "idempotency_implemented": true/false,
    "circuit_breaker_configured": true/false,
    "audit_logging_enabled": true/false,
    "contract_tests_written": true/false,
    "rate_limit_handling": true/false
  }},
  "connector_spec": {{...}},
  "mcp_tool_schemas": ["...", ...],
  "event_schema": {{...}},
  "deployment_config": {{...}}
}}"""
        raw = self._call_llm(system, user)
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            result = json.loads(raw[start:end])
        except Exception:
            result = {"raw": raw, "integration_ready": False}
        result["plan"] = plan
        return result

    def observe(self, execution_result: dict[str, Any]) -> dict[str, Any]:
        validation = execution_result.get("validation", {})
        failed = [k for k, v in validation.items() if not v]
        return {
            "integration_ready": execution_result.get("integration_ready", False),
            "failed_checks": failed,
            "failed_count": len(failed),
        }

    def reflect(self, observations: dict[str, Any]) -> str:
        failed = observations.get("failed_checks", [])
        if failed:
            return (
                f"INTEGRATION NOT READY — {len(failed)} check(s) failed: "
                f"{', '.join(failed)}. Zero data loss guarantee cannot be made."
            )
        return (
            "Integration ready for production. "
            "Auth ✓ | Retry ✓ | DLQ ✓ | Idempotency ✓ | "
            "Circuit breaker ✓ | Audit log ✓ | Contract tests ✓"
        )
