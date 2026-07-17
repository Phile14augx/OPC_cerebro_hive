from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey
from app.models.registry import Agent
from app.security import get_current_api_key

router = APIRouter(prefix="/agents", tags=["agents"])


class AgentCreate(BaseModel):
    slug: str
    name: str
    description: str = ""
    category: str = "general"
    capabilities: list[str] = []
    permissions: dict = {}
    tools: list[str] = []
    skills: list[str] = []
    llm_provider: str = "mock"
    llm_model: str = "mock-1"
    temperature: float = 0.3
    reasoning_profile: str = "chain_of_thought"
    memory_profile: str = "standard"
    deployment_target: str = "local"


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
def create_agent(payload: AgentCreate, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Agent:
    if db.query(Agent).filter(Agent.slug == payload.slug).first():
        raise HTTPException(409, f"agent '{payload.slug}' already exists")

    agent = Agent(**payload.model_dump())
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.patch("/{slug}/status", response_model=AgentOut)
def set_agent_status(slug: str, status: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Agent:
    agent = db.query(Agent).filter(Agent.slug == slug).first()
    if agent is None:
        raise HTTPException(404, "agent not found")
    if status not in ("active", "disabled"):
        raise HTTPException(400, "status must be 'active' or 'disabled'")
    agent.status = status
    db.commit()
    db.refresh(agent)
    return agent


@router.delete("/{slug}", status_code=204)
def delete_agent(slug: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> None:
    agent = db.query(Agent).filter(Agent.slug == slug).first()
    if agent is None:
        raise HTTPException(404, "agent not found")
    db.delete(agent)
    db.commit()
