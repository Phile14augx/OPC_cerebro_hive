from datetime import datetime

import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.governance import AuditLog
from app.models.identity import APIKey
from app.models.registry import Agent
from app.security import get_current_api_key

router = APIRouter(prefix="/agents", tags=["agents"])

_SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$|^[a-z0-9]$")


class AgentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    slug: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    category: str = Field(default="general", max_length=100)
    capabilities: list[str] = Field(default_factory=list, max_length=50)
    permissions: dict = Field(default_factory=dict)
    tools: list[str] = Field(default_factory=list, max_length=50)
    skills: list[str] = Field(default_factory=list, max_length=50)
    llm_provider: str = Field(default="mock", max_length=100)
    llm_model: str = Field(default="mock-1", max_length=100)
    temperature: float = Field(default=0.3, ge=0.0, le=2.0)
    reasoning_profile: str = Field(default="chain_of_thought", max_length=100)
    memory_profile: str = Field(default="standard", max_length=100)
    deployment_target: str = Field(default="local", max_length=100)

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, value: str) -> str:
        if not _SLUG_RE.match(value):
            raise ValueError("slug must be lowercase alphanumeric with hyphens")
        return value


class AgentOut(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    version: str
    category: str
    capabilities: list
    tools: list
    skills: list
    llm_provider: str
    llm_model: str
    reasoning_profile: str
    lifecycle_state: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[AgentOut])
def list_agents(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[Agent]:
    return db.query(Agent).order_by(Agent.created_at.desc()).all()


@router.get("/{slug}", response_model=AgentOut)
def get_agent(slug: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Agent:
    agent = db.query(Agent).filter(Agent.slug == slug).first()
    if agent is None:
        raise HTTPException(404, "agent not found")
    return agent


@router.post("", response_model=AgentOut, status_code=201)
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Agent:
    if db.query(Agent).filter(Agent.slug == payload.slug).first():
        raise HTTPException(409, f"agent '{payload.slug}' already exists")

    agent = Agent(**payload.model_dump())
    db.add(agent)
    db.commit()
    db.refresh(agent)

    db.add(AuditLog(actor=key.owner, action="agent.created", target=agent.slug, meta={"category": agent.category}))
    db.commit()
    return agent


@router.patch("/{slug}/status", response_model=AgentOut)
def set_agent_status(slug: str, status: str, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Agent:
    agent = db.query(Agent).filter(Agent.slug == slug).first()
    if agent is None:
        raise HTTPException(404, "agent not found")
    if status not in ("active", "disabled"):
        raise HTTPException(400, "status must be 'active' or 'disabled'")
    agent.status = status
    db.commit()
    db.refresh(agent)

    db.add(AuditLog(actor=key.owner, action=f"agent.status.{status}", target=agent.slug, meta={}))
    db.commit()
    return agent


@router.delete("/{slug}", status_code=204)
def delete_agent(slug: str, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> None:
    agent = db.query(Agent).filter(Agent.slug == slug).first()
    if agent is None:
        raise HTTPException(404, "agent not found")
    db.delete(agent)
    db.commit()

    db.add(AuditLog(actor=key.owner, action="agent.deleted", target=slug, meta={}))
    db.commit()
