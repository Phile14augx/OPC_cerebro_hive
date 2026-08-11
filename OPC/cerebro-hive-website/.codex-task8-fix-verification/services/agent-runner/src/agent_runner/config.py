"""Configuration for the agent-runner service."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Service
    port: int = 8960
    host: str = "0.0.0.0"
    log_level: str = "info"

    # swarm-api
    swarm_api_url: str = "http://swarm-api:8910"

    # LLM backend: "anthropic" | "mock"
    ai_provider: str = "mock"
    anthropic_api_key: str = ""

    # ── Strategic / Core Agents (claude-opus-4-5) ─────────────────────────────
    ceo_model: str = "claude-opus-4-5"
    enterprise_architect_model: str = "claude-opus-4-5"
    project_manager_model: str = "claude-opus-4-5"
    solution_architect_model: str = "claude-opus-4-5"
    technical_lead_model: str = "claude-opus-4-5"
    product_manager_model: str = "claude-opus-4-5"
    sales_strategist_model: str = "claude-opus-4-5"
    customer_success_manager_model: str = "claude-opus-4-5"

    # ── Engineering Specialists (claude-opus-4-5) ─────────────────────────────
    backend_engineer_model: str = "claude-opus-4-5"
    frontend_engineer_model: str = "claude-opus-4-5"
    devops_sre_model: str = "claude-opus-4-5"
    ai_engineer_model: str = "claude-opus-4-5"
    qa_engineer_model: str = "claude-opus-4-5"
    security_architect_model: str = "claude-opus-4-5"
    technical_writer_model: str = "claude-opus-4-5"
    marketing_strategist_model: str = "claude-opus-4-5"
    research_scientist_model: str = "claude-opus-4-5"
    ux_designer_model: str = "claude-opus-4-5"
    data_engineer_model: str = "claude-opus-4-5"
    platform_engineer_model: str = "claude-opus-4-5"
    integration_engineer_model: str = "claude-opus-4-5"

    # ── AI Sub-Team (claude-opus-4-5) ─────────────────────────────────────────
    ai_platform_engineer_model: str = "claude-opus-4-5"
    prompt_engineer_model: str = "claude-opus-4-5"
    ml_engineer_model: str = "claude-opus-4-5"
    llmops_engineer_model: str = "claude-opus-4-5"
    ai_integration_engineer_model: str = "claude-opus-4-5"

    # ── Security Sub-Team (claude-opus-4-5) ───────────────────────────────────
    appsec_engineer_model: str = "claude-opus-4-5"
    cloud_security_engineer_model: str = "claude-opus-4-5"
    devsecops_engineer_model: str = "claude-opus-4-5"
    identity_engineer_model: str = "claude-opus-4-5"
    compliance_specialist_model: str = "claude-opus-4-5"
    security_operations_engineer_model: str = "claude-opus-4-5"

    # ── QA Sub-Team (claude-sonnet-4-6) ───────────────────────────────────────
    qa_automation_engineer_model: str = "claude-sonnet-4-6"
    performance_test_engineer_model: str = "claude-sonnet-4-6"
    manual_test_engineer_model: str = "claude-sonnet-4-6"
    accessibility_specialist_model: str = "claude-sonnet-4-6"
    ai_evaluation_specialist_model: str = "claude-sonnet-4-6"

    # ── Marketing Sub-Team (claude-sonnet-4-6) ────────────────────────────────
    content_strategist_model: str = "claude-sonnet-4-6"
    seo_specialist_model: str = "claude-sonnet-4-6"
    growth_marketer_model: str = "claude-sonnet-4-6"
    social_media_manager_model: str = "claude-sonnet-4-6"
    devrel_engineer_model: str = "claude-sonnet-4-6"
    community_manager_model: str = "claude-sonnet-4-6"
    pr_specialist_model: str = "claude-sonnet-4-6"
    campaign_manager_model: str = "claude-sonnet-4-6"
    graphic_designer_model: str = "claude-sonnet-4-6"

    # ── Documentation Sub-Team (claude-sonnet-4-6) ────────────────────────────
    documentation_specialist_model: str = "claude-sonnet-4-6"
    api_documentation_writer_model: str = "claude-sonnet-4-6"

    # ── Legacy / Original Agents ──────────────────────────────────────────────
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

    agent_runner_endpoint: str = "http://agent-runner:8960"
    heartbeat_interval_seconds: int = 30


settings = Settings()
