"""Integration Engineer skills — BaseTool subclasses."""
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


class ConnectorInput(BaseModel):
    target_system: str = Field(..., description="Target system to integrate with")
    integration_type: str = Field(default="bidirectional", description="Type: read|write|bidirectional|event")

class MCPServerInput(BaseModel):
    tool_name: str = Field(..., description="MCP tool/server name to create")
    capabilities: list[str] = Field(..., description="Capabilities the MCP server exposes")

class EventStreamInput(BaseModel):
    event_type: str = Field(..., description="Event type or domain")
    producer: str = Field(..., description="Event producer system")
    consumer: str = Field(..., description="Event consumer system")

class ContractInput(BaseModel):
    provider: str = Field(..., description="API provider name")
    consumer: str = Field(..., description="API consumer name")
    contract_type: str = Field(default="pact", description="Contract type: pact|openapi|asyncapi")


class ConnectorDevelopmentSkill(BaseTool):
    name: str = "connector_development"
    description: str = "Build enterprise system connectors with retry, DLQ, and audit logging."
    args_schema: type[BaseModel] = ConnectorInput

    def _run(self, target_system: str, integration_type: str = "bidirectional") -> str:
        return (
            f"Connector: CerebroHive ↔ {target_system} ({integration_type})\n"
            "Features: OAuth2/API key auth | Schema validation | "
            "Exponential backoff retry (max 5) | Dead-letter queue | "
            "Audit log (all operations) | Rate limit handling | "
            "Circuit breaker | Health check endpoint | "
            "Connector SDK pattern (TypeScript)"
        )


class MCPServerSkill(BaseTool):
    name: str = "mcp_server"
    description: str = "Develop Model Context Protocol (MCP) servers for AI tool integration."
    args_schema: type[BaseModel] = MCPServerInput

    def _run(self, tool_name: str, capabilities: list[str]) -> str:
        caps = "\n".join(f"  - {c}" for c in capabilities)
        return (
            f"MCP server: {tool_name}\n"
            f"Capabilities:\n{caps}\n"
            "Implementation: MCP SDK (TypeScript) | Tool schemas (Zod) | "
            "Auth: JWT bearer | Rate limiting | Input sanitisation | "
            "Response streaming | Error mapping | Test suite"
        )


class EventStreamingSkill(BaseTool):
    name: str = "event_streaming"
    description: str = "Design event-driven integration flows using NATS JetStream."
    args_schema: type[BaseModel] = EventStreamInput

    def _run(self, event_type: str, producer: str, consumer: str) -> str:
        return (
            f"Event stream: {producer} → [{event_type}] → {consumer}\n"
            "Broker: NATS JetStream\n"
            "Pattern: At-least-once delivery | Subject hierarchy | "
            "Consumer groups | Flow control | Message TTL | "
            "Schema registry (Avro/JSON Schema) | DLQ | Monitoring"
        )


class ContractTestingSkill(BaseTool):
    name: str = "contract_testing"
    description: str = "Write and maintain consumer-driven contract tests for integrations."
    args_schema: type[BaseModel] = ContractInput

    def _run(self, provider: str, consumer: str, contract_type: str = "pact") -> str:
        return (
            f"Contract test: {consumer} → {provider} ({contract_type})\n"
            "Framework: Pact (consumer-driven) | PactFlow broker\n"
            "Covers: Request/response schema | Required fields | "
            "Error cases | Provider state setup | "
            "CI integration: fail PR if contract broken"
        )


INTEGRATION_ENGINEER_SKILLS: list[BaseTool] = [
    ConnectorDevelopmentSkill(),
    MCPServerSkill(),
    EventStreamingSkill(),
    ContractTestingSkill(),
]
