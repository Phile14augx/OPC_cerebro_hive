import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class APIKey(Base):
    """Stands in for full Keycloak/OIDC + JWT + RBAC/ABAC in the MVP.

    Production swap-in: Keycloak (OIDC) issuing JWTs validated against
    RBAC/ABAC policies stored in the governance engine.
    """

    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    key: Mapped[str] = mapped_column(String, unique=True, index=True)
    owner: Mapped[str] = mapped_column(String)
    trust_level: Mapped[str] = mapped_column(String, default="standard")
    # Tenant scope for every multi-tenant domain module (finance/ERP, etc).
    # Nullable for backward compatibility with keys minted before this column
    # existed; POST /auth/api-keys now always sets it (auto-creating an
    # Organization if the caller doesn't pass one), so this should only ever
    # be null for pre-existing rows in an old database.
    organization_id: Mapped[str | None] = mapped_column(String, ForeignKey("organizations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    revoked: Mapped[bool] = mapped_column(default=False)
