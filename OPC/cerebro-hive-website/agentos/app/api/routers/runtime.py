from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core import runtime as runtime_core
from app.db import get_db
from app.models.identity import APIKey
from app.models.execution import Run
from app.models.registry import Agent
from app.rate_limit import limiter
from app.security import get_current_api_key

router = APIRouter(prefix="/runtime", tags=["runtime"])


class ExecuteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agent_slug: str = Field(min_length=1, max_length=200)
    goal: str = Field(min_length=1, max_length=4000)


class RunOut(BaseModel):
    id: str
    agent_id: str
    goal: str
    status: str
    plan: list
    steps_completed: list
    result: str | None
    error: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/execute", response_model=RunOut)
@limiter.limit("30/minute")
def execute(request: Request, payload: ExecuteRequest, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Run:
    agent = db.query(Agent).filter(Agent.slug == payload.agent_slug).first()
    if agent is None:
        raise HTTPException(404, f"agent '{payload.agent_slug}' not found")
    if agent.status != "active":
        raise HTTPException(409, f"agent '{payload.agent_slug}' is disabled")

    return runtime_core.execute(db, agent, payload.goal)


@router.get("/runs/{run_id}", response_model=RunOut)
def get_run(run_id: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Run:
    run = db.query(Run).filter(Run.id == run_id).first()
    if run is None:
        raise HTTPException(404, "run not found")
    return run


@router.get("/runs", response_model=list[RunOut])
def list_runs(
    agent_slug: str | None = None,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> list[Run]:
    query = db.query(Run)
    if agent_slug:
        agent = db.query(Agent).filter(Agent.slug == agent_slug).first()
        if agent is None:
            raise HTTPException(404, f"agent '{agent_slug}' not found")
        query = query.filter(Run.agent_id == agent.id)
    return query.order_by(Run.created_at.desc()).limit(100).all()
