from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import workflow_engine
from app.db import get_db
from app.models.identity import APIKey
from app.models.execution import WorkflowRun
from app.security import get_current_api_key

router = APIRouter(prefix="/workflows", tags=["workflows"])


class WorkflowCreate(BaseModel):
    name: str
    definition: dict  # {"start": "n1", "nodes": {...}}
    context: dict = {}


class WorkflowOut(BaseModel):
    id: str
    workflow_name: str
    status: str
    node_states: dict
    context: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("", response_model=WorkflowOut, status_code=201)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> WorkflowRun:
    run = WorkflowRun(workflow_name=payload.name, definition=payload.definition, context=payload.context, status="running", node_states={})
    db.add(run)
    db.commit()
    db.refresh(run)
    return workflow_engine.step(db, run)


@router.get("/{workflow_run_id}", response_model=WorkflowOut)
def get_workflow(workflow_run_id: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> WorkflowRun:
    run = db.query(WorkflowRun).filter(WorkflowRun.id == workflow_run_id).first()
    if run is None:
        raise HTTPException(404, "workflow run not found")
    return run


@router.post("/{workflow_run_id}/resume", response_model=WorkflowOut)
def resume_workflow(workflow_run_id: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> WorkflowRun:
    run = db.query(WorkflowRun).filter(WorkflowRun.id == workflow_run_id).first()
    if run is None:
        raise HTTPException(404, "workflow run not found")
    if run.status != "paused":
        raise HTTPException(409, f"workflow is '{run.status}', not paused")
    return workflow_engine.step(db, run)
