"""Planner service configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # LLM provider: "anthropic" | "openai" | "mock"
    ai_provider: str = "anthropic"
    anthropic_api_key: str = ""
    openai_api_key: str = ""

    # Model IDs
    anthropic_model: str = "claude-sonnet-4-6"
    openai_model: str = "gpt-4o"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Service
    port: int = 8920
    log_level: str = "info"

    # Planning limits
    max_tasks_per_dag: int = 24
    planner_timeout_seconds: int = 60


settings = Settings()
