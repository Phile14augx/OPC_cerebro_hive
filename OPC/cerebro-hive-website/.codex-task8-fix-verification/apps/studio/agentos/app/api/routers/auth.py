from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey, Organization
from app.rate_limit import limiter
from app.security import generate_api_key, get_current_api_key, require_admin_secret

router = APIRouter(prefix="/auth", tags=["auth"])


class CreateAPIKeyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    owner: str = Field(min_length=1, max_length=200)
    trust_level: str = Field(default="standard", max_length=50)
    # Tenant scope for multi-tenant modules (finance/ERP, etc). Existing
    # callers that don't know about organizations yet can omit this — a new
    # Organization named after `owner` is created automatically, so every key
    # always ends up scoped to *some* tenant.
    organization_id: str | None = Field(default=None, max_length=100)
    organization_name: str | None = Field(default=None, max_length=200)


class APIKeyResponse(BaseModel):
    id: str
    api_key: str
    owner: str
    organization_id: str


class OrganizationOut(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True


@router.post("/api-keys", response_model=APIKeyResponse, dependencies=[Depends(require_admin_secret)])
@limiter.limit("10/minute")
def create_api_key(request: Request, payload: CreateAPIKeyRequest, db: Session = Depends(get_db)) -> APIKeyResponse:
    """Bootstraps identity for the MVP. Gated by AGENTOS_ADMIN_SECRET once
    that's set (see app/security.py::require_admin_secret) — open by default
    only so local dev with zero config keeps working. Production swap-in:
    Keycloak/OIDC issuing JWTs (see app/platform/auth/keycloak.py), with this
    endpoint replaced by a proper admin-only provisioning flow.
    """
    if payload.organization_id:
        org = db.query(Organization).filter(Organization.id == payload.organization_id).first()
        if org is None:
            raise HTTPException(404, f"organization '{payload.organization_id}' not found")
    else:
        org = Organization(name=payload.organization_name or f"{payload.owner}'s organization")
        db.add(org)
        db.commit()
        db.refresh(org)

    key_value = generate_api_key()
    key = APIKey(key=key_value, owner=payload.owner, trust_level=payload.trust_level, organization_id=org.id)
    db.add(key)
    db.commit()
    db.refresh(key)
    return APIKeyResponse(id=key.id, api_key=key.key, owner=key.owner, organization_id=key.organization_id)


@router.get("/organizations", response_model=list[OrganizationOut])
def list_organizations(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[Organization]:
    # NOTE: lists every organization on the deployment, not just the caller's
    # own — fine for an admin/debug tool with a handful of demo tenants, but a
    # real cross-tenant info leak (org names only, no financial data) that
    # should be scoped to `_key.organization_id` (or admin-only) before this
    # is used with real, unrelated customers on the same deployment.
    return db.query(Organization).order_by(Organization.created_at.desc()).all()
