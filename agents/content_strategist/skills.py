"""content_strategist skills."""
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

class TaskInput(BaseModel):
    objective: str = Field(..., description="Task objective")
    context: str = Field(default="", description="Additional context")

class PrimarySkill(BaseTool):
    name: str = "content_strategist_skill"
    description: str = "Primary skill for content_strategist."
    args_schema: type[BaseModel] = TaskInput
    def _run(self, objective: str, context: str = "") -> str:
        return f"content_strategist: {objective}\nContext: {context or 'none'}\nOutput: professional deliverable aligned to CerebroHive brand and goals."

CONTENT_STRATEGIST_SKILLS = [PrimarySkill()]
