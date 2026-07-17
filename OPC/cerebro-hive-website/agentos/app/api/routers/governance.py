from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import runtime as runtime_core
from app.core import workflow_engine
from app.db import get_db
from app.models.identity import APIKey
from app.models.execution import Run, WorkflowRun
from app.models.governance import Approval, AuditLog, Policy
from app.security import get_current_api_key

router = APIRouter(prefix="/governance", tags=["governance"])


class PolicyCreate(BaseModel):
    name: str
    description: str = ""
    rule: dict  # {"if": {"field": ..., "op": "==", "value": ...}, "then": "require_approval"|"block"}


class PolicyOut(BaseModel):
    id: str
    name: str
    description: str
    rule: dict
    enabled: bool

    class Config:
        from_attributes = True


class ApprovalOut(BaseModel):
    id: str
    run_id: str
    policy_name: str
    reason: str
    status: str
    decided_by: str | None
    decision_note: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class DecideRequest(BaseModel):
    decision: str  # "approve" | "reject"
    decided_by: str = "unknown"
    note: str = ""


@router.get("/policies", response_model=list[PolicyOut])
def list_policies(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[Policy]:
    return db.query(Policy).all()


@router.post("/policies", response_model=PolicyOut, status_code=201)
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> Policy:
    if db.query(Policy).filter(Policy.name == payload.name).first():
        raise HTTPException(409, f"policy '{payload.name}' already exists")
    policy = Policy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/approvals", response_model=list[ApprovalOut])
def list_approvals(
    status: str | None = None,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> list[Approval]:
    query = db.query(Approval)
    if status:
        query = query.filter(Approval.status == status)
    return query.order_by(Approval.created_at.desc()).all()


@router.post("/approvals/{approval_id}/decide", response_model=ApprovalOut)
def decide_approval(
    approval_id: str,
    payload: DecideRequest,
    db: Session = Depends(get_db),
    key: APIKey = Depends(get_current_api_key),
) -> Approval:
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if approval is None:
        raise HTTPException(404, "approval not found")
    if approval.status != "pending":
        raise HTTPException(409, f"approval already {approval.status}")
    if payload.decision not in ("approve", "reject"):
        raise HTTPException(400, "decision must be 'approve' or 'reject'")

    approval.status = "approved" if payload.decision == "approve" else "rejected"
    approval.decided_by = payload.decided_by or key.owner
    approval.decision_note = payload.note
    approval.decided_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(approval)

    db.add(
        AuditLog(
            actor=approval.decided_by,
            action=f"approval.{approval.status}",
            target=approval.run_id,
            meta={"policy_name": approval.policy_name, "note": payload.note},
        )
    )
    db.commit()

    if payload.decision == "approve":
        run = db.query(Run).filter(Run.id == approval.run_id).first()
        if run is not None and run.status == "pending_approval":
            runtime_core.resume_after_approval(db, run)
        else:
            workflow_run = db.query(WorkflowRun).filter(WorkflowRun.id == approval.run_id).first()
            if workflow_run is not None and workflow_run.status == "paused":
                workflow_engine.step(db, workflow_run)

    return approval
