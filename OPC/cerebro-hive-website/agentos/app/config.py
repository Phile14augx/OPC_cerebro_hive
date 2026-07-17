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


@lru_cache
def get_settings() -> Settings:
    return Settings()
