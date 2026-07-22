from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ─── Database ──────────────────────────────────────────────────────
    database_url: str = "sqlite:///./agentos.db"

    # ─── AI Providers ──────────────────────────────────────────────────
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    google_api_key: str | None = None
    ollama_base_url: str = "http://localhost:11434"

    # ─── Platform Auth ─────────────────────────────────────────────────
    agentos_jwt_secret: str = "change-me-in-production"
    agentos_policy_file: str = "./agentos_policies.yaml"

    # Keycloak OIDC (enterprise identity)
    keycloak_url: str | None = None          # e.g. http://localhost:8080
    keycloak_realm: str = "cerebrohive"
    keycloak_client_id: str = "cerebrohive-platform"
    keycloak_client_secret: str | None = None

    # ─── Event Bus (NATS JetStream) ────────────────────────────────────
    nats_url: str | None = None              # e.g. nats://localhost:4222

    # ─── Object Storage (MinIO) ────────────────────────────────────────
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin123"
    minio_secure: bool = False

    # ─── Search (OpenSearch) ───────────────────────────────────────────
    opensearch_url: str | None = None        # e.g. https://localhost:9200
    opensearch_user: str = "admin"
    opensearch_password: str = "Opensearch@123!"

    # ─── Redis ─────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379"
    redis_password: str | None = None

    # ─── Agent Store ───────────────────────────────────────────────────
    agent_store_dir: str = str(Path(__file__).resolve().parent.parent / "agents_store")

    # ─── Production Gates ──────────────────────────────────────────────
    agentos_admin_secret: str | None = None
    agentos_allowed_origins: str = "http://localhost:3000"
    agentos_environment: str = "development"
    agentos_max_body_bytes: int = 1_000_000
    agentos_request_timeout_seconds: float = 30.0

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.agentos_allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.agentos_environment.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
