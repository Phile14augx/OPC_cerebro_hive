"""Configuration for the agent-runner service."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Service
    port: int = 8960
    host: str = "0.0.0.0"
    log_level: str = "info"

    # swarm-api — used for registration, heartbeat, and task fetches
    swarm_api_url: str = "http://swarm-api:8910"

    # LLM backend: "anthropic" | "mock"
    ai_provider: str = "mock"
    anthropic_api_key: str = ""

    # Per-agent model overrides (default to same model)
    orchestrator_model: str = "claude-sonnet-4-6"
    critic_model: str = "claude-sonnet-4-6"
    coding_model: str = "claude-sonnet-4-6"
    research_model: str = "claude-sonnet-4-6"

    # LLM generation settings
    max_tokens: int = 4096
    temperature: float = 0.3

    # Registration
    agent_version: str = "0.1.0"
    agent_owner: str = "hiveswarm-core"
    agent_concurrency: int = 5

    # Self-reported endpoint (must be reachable by swarm-runtime workers)
    agent_runner_endpoint: str = "http://agent-runner:8960"

    # Heartbeat interval in seconds
    heartbeat_interval_seconds: int = 30


settings = Settings()
