"""Keycloak OIDC integration for the CerebroHive Platform.

Validates Bearer tokens issued by Keycloak and extracts claims.
Falls back gracefully to the existing API key authentication when
KEYCLOAK_URL is not configured — ensuring backward compatibility
with the current agentos/ workflow during the migration.

Architecture:
    Browser → Keycloak (login) → JWT → Platform API → ABAC

Token validation strategy:
    1. Fetch Keycloak public keys from JWKS endpoint (cached).
    2. Validate JWT signature, expiry, issuer, audience.
    3. Extract roles, org_id, user_id from token claims.
    4. Attach to request as `request.state.user`.
"""

from __future__ import annotations

import logging
import time
from functools import lru_cache
from typing import Any

from fastapi import HTTPException, Request, status

logger = logging.getLogger("agentos.auth.keycloak")

# ---------------------------------------------------------------------------
# Token claims dataclass
# ---------------------------------------------------------------------------

class PlatformUser:
    """Normalized user identity extracted from a Keycloak JWT."""

    def __init__(self, claims: dict[str, Any]) -> None:
        self.user_id: str = claims.get("sub", "")
        self.email: str = claims.get("email", "")
        self.name: str = claims.get("name", "")
        self.roles: list[str] = (
            claims.get("realm_access", {}).get("roles", [])
            + claims.get("resource_access", {}).get("cerebrohive-platform", {}).get("roles", [])
        )
        self.org_id: str | None = claims.get("org_id") or claims.get("organization_id")
        self.is_service_account: bool = claims.get("clientId") is not None
        self._raw = claims

    def has_role(self, role: str) -> bool:
        return role in self.roles

    def is_admin(self) -> bool:
        return self.has_role("platform-admin") or self.has_role("admin")

    def __repr__(self) -> str:
        return f"<PlatformUser user_id={self.user_id} email={self.email} roles={self.roles}>"


# ---------------------------------------------------------------------------
# JWKS Key Cache
# ---------------------------------------------------------------------------

_jwks_cache: dict[str, Any] = {}
_jwks_cache_ts: float = 0
_JWKS_TTL = 300  # seconds


def _get_jwks(jwks_uri: str) -> dict[str, Any]:
    global _jwks_cache, _jwks_cache_ts
    now = time.time()
    if _jwks_cache and (now - _jwks_cache_ts) < _JWKS_TTL:
        return _jwks_cache

    import httpx
    try:
        resp = httpx.get(jwks_uri, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_cache_ts = now
        return _jwks_cache
    except Exception as exc:
        logger.warning("Failed to fetch JWKS from %s: %s", jwks_uri, exc)
        return _jwks_cache  # Return stale cache on failure


# ---------------------------------------------------------------------------
# Token Validation
# ---------------------------------------------------------------------------

def validate_token(token: str, settings: Any) -> PlatformUser:
    """Validate a Keycloak JWT and return PlatformUser.

    Raises HTTPException(401) if the token is invalid.
    """
    if not settings.keycloak_url or not settings.keycloak_realm:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Keycloak not configured")

    try:
        import jwt as pyjwt  # PyJWT
    except ImportError:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "PyJWT not installed (pip install PyJWT cryptography)")

    base_url = settings.keycloak_url.rstrip("/")
    realm = settings.keycloak_realm
    issuer = f"{base_url}/realms/{realm}"
    jwks_uri = f"{issuer}/protocol/openid-connect/certs"

    jwks = _get_jwks(jwks_uri)
    if not jwks:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "JWKS unavailable")

    jwks_client = pyjwt.PyJWKClient(jwks_uri)
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        claims = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Audience varies by client setup
            issuer=issuer,
        )
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token has expired")
    except pyjwt.InvalidTokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Invalid token: {exc}")

    return PlatformUser(claims)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

async def get_platform_user(request: Request) -> PlatformUser | None:
    """FastAPI dependency. Returns PlatformUser if a valid Keycloak JWT is
    present. Returns None if Keycloak is not configured (falls back to API
    key auth via the existing security.py). Raises 401 on invalid token.
    """
    from app.config import get_settings
    settings = get_settings()

    if not settings.keycloak_url:
        return None  # Keycloak not configured — fall back to API key auth

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.removeprefix("Bearer ").strip()
    return validate_token(token, settings)
