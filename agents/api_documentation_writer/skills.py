"""API Documentation Writer skills."""
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

class APIDocInput(BaseModel):
    endpoint_or_sdk: str = Field(..., description="Endpoint, SDK method, or resource to document")
    doc_type: str = Field(default="reference", description="Type: reference|quickstart|guide|changelog")

class APIDocSkill(BaseTool):
    name: str = "api_doc_writing"
    description: str = "Write API reference documentation with code examples."
    args_schema: type[BaseModel] = APIDocInput
    def _run(self, endpoint_or_sdk: str, doc_type: str = "reference") -> str:
        return f"API docs: {endpoint_or_sdk} ({doc_type})\nSections: Overview | Authentication | Request/Response schema | Code examples (TS/Python/curl) | Error codes | Rate limits | SDK methods\nTarget: developer time-to-first-call <=5min"

API_DOCUMENTATION_WRITER_SKILLS = [APIDocSkill()]
