"""DevSecOps Engineer skills."""
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

class PipelineInput(BaseModel):
    repo: str = Field(..., description="Repository or service name")
    language: str = Field(default="typescript", description="Primary language")

class SecurityPipelineSkill(BaseTool):
    name: str = "security_pipeline"
    description: str = "Design and implement DevSecOps security gates in CI/CD pipelines."
    args_schema: type[BaseModel] = PipelineInput
    def _run(self, repo: str, language: str = "typescript") -> str:
        return (
            f"Security pipeline: {repo} ({language})\n"
            "Gates: CodeQL (SAST) | Semgrep (custom rules) | Trivy (container+IaC) | "
            "TruffleHog (secrets) | OWASP ZAP (DAST) | OPA Gatekeeper (admission) | "
            "Dependency Review | License compliance\nAll gates: fail-closed, non-bypassable"
        )

DEVSECOPS_ENGINEER_SKILLS = [SecurityPipelineSkill()]
