import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey

bearer_scheme = HTTPBearer(auto_error=False)


def generate_api_key() -> str:
    return f"aos_{secrets.token_urlsafe(32)}"


def get_current_api_key(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> APIKey:
    """Stands in for Keycloak/OIDC + JWT + RBAC/ABAC. Every request must carry
    a bearer token issued by POST /auth/api-keys.
    """
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    key = db.query(APIKey).filter(APIKey.key == credentials.credentials, APIKey.revoked.is_(False)).first()
    if key is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or revoked API key")
    return key
