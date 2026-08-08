"""AppSec Engineer skills."""
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

class CodeReviewInput(BaseModel):
    code_diff: str = Field(..., description="Code diff or file to review")
    language: str = Field(default="typescript", description="Language")

class ThreatModelInput(BaseModel):
    feature: str = Field(..., description="Feature to threat model")
    architecture: str = Field(default="", description="Architecture description")

class SecureCodeReviewSkill(BaseTool):
    name: str = "secure_code_review"
    description: str = "Perform security-focused code review against OWASP Top 10."
    args_schema: type[BaseModel] = CodeReviewInput
    def _run(self, code_diff: str, language: str = "typescript") -> str:
        return f"AppSec review ({language}): OWASP Top 10 check | Injection | XSS | Auth | Crypto | Secrets | SSRF | Insecure deserialization"

class ThreatModellingSkill(BaseTool):
    name: str = "threat_modelling"
    description: str = "Run STRIDE threat modelling for a feature."
    args_schema: type[BaseModel] = ThreatModelInput
    def _run(self, feature: str, architecture: str = "") -> str:
        return f"STRIDE threat model: {feature}\nSpoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation of Privilege\nOutput: threat list + mitigations + residual risk"

APPSEC_ENGINEER_SKILLS = [SecureCodeReviewSkill(), ThreatModellingSkill()]
