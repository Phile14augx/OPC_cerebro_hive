import hmac
import secrets

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_db
from app.models.identity import APIKey

bearer_scheme = HTTPBearer(auto_error=False)


def generate_api_key() -> str:
    return f"aos_{secrets.token_urlsafe(32)}"


def require_admin_secret(x_admin_secret: str | None = Header(default=None)) -> None:
    """Gate for POST /auth/api-keys. If AGENTOS_ADMIN_SECRET is unset (the
    local-dev default), this is a no-op — anyone can bootstrap a key, same
    as the original MVP. Once that env var is set (required before deploying
    anywhere public), every key-issuance request must present it via the
    `X-Admin-Secret` header, or get a 403. hmac.compare_digest avoids a
    timing side-channel on the comparison.
    """
    configured = get_settings().agentos_admin_secret
    if not configured:
        return
    if not x_admin_secret or not hmac.compare_digest(x_admin_secret, configured):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Missing or invalid X-Admin-Secret")


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
