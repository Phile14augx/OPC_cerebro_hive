"""Evaluation service configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ai_provider: str = "anthropic"
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    anthropic_model: str = "claude-haiku-4-5-20251001"  # fast + cheap for eval
    openai_model: str = "gpt-4o-mini"

    port: int = 8922
    log_level: str = "info"
    evaluator_timeout_seconds: int = 30


settings = Settings()
