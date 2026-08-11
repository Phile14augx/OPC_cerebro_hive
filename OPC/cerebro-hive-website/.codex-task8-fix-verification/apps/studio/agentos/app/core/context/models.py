"""Context Engine — Universal Runtime Context Models."""

from typing import Any
from pydantic import BaseModel, Field
from datetime import datetime

class ExecutionContext(BaseModel):
    """The universal runtime context for all cognitive operations."""
    
    # 1. Identity & Permissions
    user_id: str
    tenant_id: str | None = None
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    
    # 2. Ephemeral State
    current_task: str | None = None
    goals: list[str] = Field(default_factory=list)
    session_id: str | None = None
    
    # 3. Knowledge & Retrieval
    knowledge_nodes: list[dict[str, Any]] = Field(default_factory=list)
    active_policies: list[dict[str, Any]] = Field(default_factory=list)
    ontology_closure: dict[str, Any] = Field(default_factory=dict)
    
    # 4. Memory Tiers
    working_memory: dict[str, Any] = Field(default_factory=dict)
    episodic_memory: list[dict[str, Any]] = Field(default_factory=list)
    strategic_memory: dict[str, Any] = Field(default_factory=dict)
    
    # 5. Tooling & Capabilities
    available_capabilities: list[str] = Field(default_factory=list)
    
    # 6. Configuration & Feature Flags
    feature_flags: dict[str, bool] = Field(default_factory=dict)
    model_config: dict[str, Any] = Field(default_factory=dict)
    
    # 7. Telemetry & Observability
    trace_id: str | None = None
    correlation_id: str | None = None
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)
