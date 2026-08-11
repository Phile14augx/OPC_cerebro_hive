"""Request/response models for the planner service.

The TaskDAG produced here is intentionally aligned with the TypeScript
TaskDAG interface defined in packages/swarm-sdk/src/types/dag.ts.
"""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


# ── Capabilities (mirrors SwarmCapability enum in swarm-sdk) ──────────────────

SWARM_CAPABILITIES = Literal[
    "Research", "Coding", "Legal", "Finance", "Marketing",
    "Sales", "HR", "Architecture", "Testing", "Security",
    "Database", "Cloud", "Planning", "Routing", "Critique",
    "Reflection", "Memory",
]

DependencyType = Literal[
    "sequential", "parallel", "conditional",
    "dynamic", "loop", "human_approval",
]

TaskPriority = Literal["critical", "high", "medium", "low"]


# ── DAG primitives ─────────────────────────────────────────────────────────────

class CapabilityRequirement(BaseModel):
    capability: SWARM_CAPABILITIES
    min_proficiency: float | None = Field(None, ge=0.0, le=1.0)
    preferred_agent_id: str | None = None


class TaskBudget(BaseModel):
    max_cost_usd: float
    max_tokens: int | None = None
    max_duration_seconds: int | None = None


class TaskNode(BaseModel):
    id: str
    name: str
    description: str
    capability: CapabilityRequirement
    input: dict[str, Any] = Field(default_factory=dict)
    budget: TaskBudget | None = None
    priority: TaskPriority = "medium"
    loop_exit_condition: str | None = None
    max_loop_iterations: int | None = None
    approvers: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class TaskEdge(BaseModel):
    source: str
    target: str
    type: DependencyType
    condition: str | None = None
    dynamic_input_template: str | None = None


class TaskDAG(BaseModel):
    id: str
    name: str
    version: int = 1
    nodes: list[TaskNode]
    edges: list[TaskEdge]
    entry_nodes: list[str]
    exit_nodes: list[str]
    total_budget: TaskBudget | None = None
    default_priority: TaskPriority = "medium"
    created_at: str
    metadata: dict[str, Any] = Field(default_factory=dict)


# ── API request / response ─────────────────────────────────────────────────────

class PlanConstraints(BaseModel):
    max_tasks: int = Field(default=12, le=24)
    max_cost_usd: float | None = None
    require_human_approval_for: list[SWARM_CAPABILITIES] = Field(default_factory=list)
    preferred_capabilities: list[SWARM_CAPABILITIES] = Field(default_factory=list)
    deadline_iso: str | None = None


class PlanRequest(BaseModel):
    goal: str = Field(..., min_length=10, max_length=4000)
    context: dict[str, Any] = Field(default_factory=dict)
    tenant_id: str
    user_id: str
    constraints: PlanConstraints = Field(default_factory=PlanConstraints)
    # Optional: pass an existing partial DAG to extend
    existing_dag_id: str | None = None


class PlanResponse(BaseModel):
    dag: TaskDAG
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    warnings: list[str] = Field(default_factory=list)
    llm_tokens_used: int = 0
