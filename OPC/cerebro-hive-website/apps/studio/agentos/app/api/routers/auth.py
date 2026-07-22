from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey
from app.rate_limit import limiter
from app.security import generate_api_key, require_admin_secret

router = APIRouter(prefix="/auth", tags=["auth"])


class CreateAPIKeyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    owner: str = Field(min_length=1, max_length=200)
    trust_level: str = Field(default="standard", max_length=50)


class APIKeyResponse(BaseModel):
    id: str
    api_key: str
    owner: str


@router.post("/api-keys", response_model=APIKeyResponse, dependencies=[Depends(require_admin_secret)])
@limiter.limit("10/minute")
def create_api_key(request: Request, payload: CreateAPIKeyRequest, db: Session = Depends(get_db)) -> APIKeyResponse:
    """Bootstraps identity for the MVP. Gated by AGENTOS_ADMIN_SECRET once
    that's set (see app/security.py::require_admin_secret) — open by default
    only so local dev with zero config keeps working. Production swap-in:
    Keycloak/OIDC issuing JWTs, with this endpoint replaced by a proper
    admin-only provisioning flow.
    """
    key_value = generate_api_key()
    key = APIKey(key=key_value, owner=payload.owner, trust_level=payload.trust_level)
    db.add(key)
    db.commit()
    db.refresh(key)
    return APIKeyResponse(id=key.id, api_key=key.key, owner=key.owner)
