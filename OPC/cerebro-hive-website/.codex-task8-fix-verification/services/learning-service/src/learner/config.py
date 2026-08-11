"""Learning service configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ai_provider: str = "anthropic"
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"
    openai_model: str = "gpt-4o"

    database_url: str = "postgresql://cerebrohive:supersecretpassword123@localhost:5432/cerebrohive_db"
    redis_url: str = "redis://localhost:6379"

    port: int = 8950
    log_level: str = "info"

    # Number of replays to use for benchmark computation
    benchmark_window: int = 100
    # Minimum replays required before running prompt optimisation
    min_replays_for_optimization: int = 10


settings = Settings()
