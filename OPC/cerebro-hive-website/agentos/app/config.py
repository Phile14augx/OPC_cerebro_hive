from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./agentos.db"

    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    ollama_base_url: str = "http://localhost:11434"

    agentos_jwt_secret: str = "change-me-in-production"
    agentos_policy_file: str = "./agentos_policies.yaml"

    agent_store_dir: str = str(Path(__file__).resolve().parent.parent / "agents_store")

    # Production gates — both empty/"*" by default so local dev (`uvicorn
    # app.main:app`) still works with zero config, exactly like the rest of
    # this MVP. Set both real values before deploying anywhere public.
    #
    # If set, POST /auth/api-keys requires header `X-Admin-Secret: <value>`.
    # If unset, key issuance stays open — fine for a laptop, not for a
    # public URL.
    agentos_admin_secret: str | None = None
    # Comma-separated list of origins allowed to call this API in the
    # browser, e.g. "https://cerebrohive.com,https://www.cerebrohive.com".
    # Defaults to the local Next.js dev server only.
    agentos_allowed_origins: str = "http://localhost:3000"

    # "development" (default) or "production". Only gates behavior that would
    # break local dev if always-on, like sending HSTS over plain HTTP.
    agentos_environment: str = "development"

    # Hard caps enforced by RequestGuardMiddleware (app/middleware.py) on every
    # request, independent of any per-route Pydantic validation.
    agentos_max_body_bytes: int = 1_000_000  # 1MB — generous for this API's JSON payloads
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
