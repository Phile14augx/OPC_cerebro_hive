"""Identity Engineer skills."""
from __future__ import annotations
from typing import Any
try:
    from crewai.tools import BaseTool
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init_subclass__(cls, **kw): ...
    def Field(*a, **kw): return None
    class BaseTool:
        name: str = ""; description: str = ""
        def _run(self, *a, **kw): return ""

class IAMInput(BaseModel):
    service: str = Field(..., description="Service or system requiring IAM")
    access_type: str = Field(default="m2m", description="Type: m2m|human|workload")

class IAMDesignSkill(BaseTool):
    name: str = "iam_design"
    description: str = "Design identity and access controls for a service or system."
    args_schema: type[BaseModel] = IAMInput
    def _run(self, service: str, access_type: str = "m2m") -> str:
        return (
            f"IAM design: {service} ({access_type})\n"
            "Pattern: JWT RS256 (human) | mTLS/SPIFFE (workload) | "
            "Vault dynamic secrets (TTL<=1h) | RBAC least-privilege | "
            "JIT admin access (no standing) | OPA policy enforcement | "
            "Audit log all auth events"
        )

IDENTITY_ENGINEER_SKILLS = [IAMDesignSkill()]
