"""AI Integration Engineer skills — BaseTool subclasses."""
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


class SDKInput(BaseModel):
    language: str = Field(..., description="SDK language: typescript|python|go")
    api_surface: list[str] = Field(..., description="API endpoints to cover")

class IntegrationGuideInput(BaseModel):
    use_case: str = Field(..., description="Integration use case to document")
    target_stack: str = Field(default="generic", description="Customer tech stack")


class SDKDevelopmentSkill(BaseTool):
    name: str = "sdk_development"
    description: str = "Build client SDKs for CerebroHive EIOS API."
    args_schema: type[BaseModel] = SDKInput

    def _run(self, language: str, api_surface: list[str]) -> str:
        return (
            f"SDK: {language} for {len(api_surface)} API endpoints\n"
            "Features: Auto-retry | Streaming support (SSE/WebSocket) | "
            "Type-safe (TypeScript strict / Python Pydantic) | "
            "Auth helpers (OAuth2, API key) | "
            "Error types with machine-readable codes | "
            "≥90% test coverage | Published to npm/PyPI"
        )


class IntegrationGuideSkill(BaseTool):
    name: str = "integration_guide"
    description: str = "Write integration guides and reference architectures."
    args_schema: type[BaseModel] = IntegrationGuideInput

    def _run(self, use_case: str, target_stack: str = "generic") -> str:
        return (
            f"Integration guide: '{use_case}' for {target_stack}\n"
            "Sections: Prerequisites | Architecture diagram | "
            "Step-by-step code walkthrough | Error handling patterns | "
            "Production checklist | Sample application (runnable) | "
            "Troubleshooting FAQ | Support channels"
        )


AI_INTEGRATION_ENGINEER_SKILLS: list[BaseTool] = [
    SDKDevelopmentSkill(),
    IntegrationGuideSkill(),
]
