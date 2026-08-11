from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.tools import registry as tool_registry, ToolError
from app.db import get_db
from app.models.identity import APIKey
from app.models.tools import ToolDefinition
from app.security import get_current_api_key

router = APIRouter(prefix="/tools", tags=["tools"])


class ToolCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    kind: str = Field(default="builtin", max_length=100)
    input_schema: dict = Field(default_factory=dict)
    permissions: list[str] = Field(default_factory=lambda: ["execute"], max_length=50)


class ToolOut(BaseModel):
    id: str
    name: str
    description: str
    kind: str
    input_schema: dict
    permissions: list
    enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_tool(cls, tool: ToolDefinition) -> "ToolOut":
        return cls(
            id=tool.id,
            name=tool.name,
            description=tool.description,
            kind=tool.kind,
            input_schema=tool.schema,
            permissions=tool.permissions,
            enabled=tool.enabled,
            created_at=tool.created_at,
        )


class InvokeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    args: dict = Field(default_factory=dict)


@router.get("", response_model=list[ToolOut])
def list_tools(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[ToolOut]:
    return [ToolOut.from_orm_tool(t) for t in db.query(ToolDefinition).all()]


@router.post("", response_model=ToolOut, status_code=201)
def register_tool(payload: ToolCreate, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> ToolOut:
    if db.query(ToolDefinition).filter(ToolDefinition.name == payload.name).first():
        raise HTTPException(409, f"tool '{payload.name}' already registered")
    tool = ToolDefinition(
        name=payload.name,
        description=payload.description,
        kind=payload.kind,
        schema=payload.input_schema,
        permissions=payload.permissions,
    )
    db.add(tool)
    db.commit()
    db.refresh(tool)
    return ToolOut.from_orm_tool(tool)


@router.post("/{name}/invoke")
def invoke_tool(name: str, payload: InvokeRequest, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> dict:
    tool = db.query(ToolDefinition).filter(ToolDefinition.name == name).first()
    permissions = tool.permissions if tool else ["execute"]
    if tool is not None and not tool.enabled:
        raise HTTPException(403, f"tool '{name}' is disabled")
    try:
        return tool_registry.invoke(name, payload.args, permissions=permissions)
    except ToolError as exc:
        raise HTTPException(400, str(exc)) from exc


@router.get("/builtins/catalog")
def builtin_catalog(_key: APIKey = Depends(get_current_api_key)) -> dict:
    return {name: tool.input_schema for name, tool in tool_registry._tools.items()}
