"""Documentation Specialist skills."""
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

class DocInput(BaseModel):
    topic: str = Field(..., description="Documentation topic")
    doc_type: str = Field(default="user_guide", description="Type: user_guide|how_to|faq|troubleshooting|release_notes")

class DocWritingSkill(BaseTool):
    name: str = "doc_writing"
    description: str = "Write user-facing documentation."
    args_schema: type[BaseModel] = DocInput
    def _run(self, topic: str, doc_type: str = "user_guide") -> str:
        return f"Documentation: {topic} ({doc_type})\nStyle: Active voice | Task-oriented | Sentence case | No 'simple/easy/just'\nFormat: Intro | Prerequisites | Steps | Expected outcome | Next steps\nPublished to: Docusaurus knowledge base"

DOCUMENTATION_SPECIALIST_SKILLS = [DocWritingSkill()]
