from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import governance_engine
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
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db), key: APIKey = Depends(get_current_api_key)) -> Policy:
    if db.query(Policy).filter(Policy.name == payload.name).first():
        raise HTTPException(409, f"policy '{payload.name}' already exists")

    op = payload.rule.get("if", {}).get("op", "==")
    if op not in governance_engine._OPS:
        raise HTTPException(400, f"unsupported operator '{op}' — valid ops: {sorted(governance_engine._OPS)}")

    policy = Policy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)

    db.add(AuditLog(actor=key.owner, action="policy.created", target=policy.name, meta={"rule": policy.rule}))
    db.commit()
    return policy


class AuditLogOut(BaseModel):
    id: str
    actor: str
    action: str
    target: str
    meta: dict
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/audit-log", response_model=list[AuditLogOut])
def list_audit_log(
    action: str | None = None,
    limit: int = 200,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> list[AuditLog]:
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    return query.order_by(AuditLog.created_at.desc()).limit(min(limit, 1000)).all()


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

            # This Run may itself have been dispatched by an `agent` or
            # `agent_vote` workflow node (Agent Mesh delegation) — if some
            # paused WorkflowRun is sitting at that node waiting on exactly
            # this sub-run, re-step it now instead of leaving it stuck.
            # There's no direct foreign key from WorkflowRun -> Run for a
            # mesh delegation (it's recorded as a `{node_id}_run_id` context
            # entry), so this scans paused workflows for a context value that
            # matches — fine at MVP scale, worth a real join if this becomes
            # a hot path.
            for workflow_run in db.query(WorkflowRun).filter(WorkflowRun.status == "paused").all():
                if run.id in workflow_run.context.values():
                    workflow_engine.step(db, workflow_run)
        else:
            workflow_run = db.query(WorkflowRun).filter(WorkflowRun.id == approval.run_id).first()
            if workflow_run is not None and workflow_run.status == "paused":
                workflow_engine.step(db, workflow_run)

    return approval
