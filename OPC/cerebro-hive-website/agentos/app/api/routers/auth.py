from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey
from app.security import generate_api_key

router = APIRouter(prefix="/auth", tags=["auth"])


class CreateAPIKeyRequest(BaseModel):
    owner: str
    trust_level: str = "standard"


class APIKeyResponse(BaseModel):
    id: str
    api_key: str
    owner: str


@router.post("/api-keys", response_model=APIKeyResponse)
def create_api_key(payload: CreateAPIKeyRequest, db: Session = Depends(get_db)) -> APIKeyResponse:
    """Bootstraps identity for the MVP. Production swap-in: Keycloak/OIDC
    issuing JWTs, with this endpoint replaced by an admin-only provisioning
    flow.
    """
    key_value = generate_api_key()
    key = APIKey(key=key_value, owner=payload.owner, trust_level=payload.trust_level)
    db.add(key)
    db.commit()
    db.refresh(key)
    return APIKeyResponse(id=key.id, api_key=key.key, owner=key.owner)
