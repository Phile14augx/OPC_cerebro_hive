"""Self-registration and heartbeat for agent-runner agents."""
from __future__ import annotations

import asyncio
import time

import httpx
import structlog

from .config import settings

log = structlog.get_logger(__name__)

# Agent registration specs — one entry per agent type
AGENT_SPECS = [
    {
        "name": "orchestrator",
        "version": settings.agent_version,
        "owner": settings.agent_owner,
        "capabilities": ["Planning"],
        "concurrency": settings.agent_concurrency,
        "endpoint": settings.agent_runner_endpoint,
        "tags": ["core", "planner", "orchestrator"],
        "metadata": {"agentType": "orchestrator", "model": settings.orchestrator_model},
    },
    {
        "name": "critic",
        "version": settings.agent_version,
        "owner": settings.agent_owner,
        "capabilities": ["Critique"],
        "concurrency": settings.agent_concurrency,
        "endpoint": settings.agent_runner_endpoint,
        "tags": ["core", "evaluator", "critic"],
        "metadata": {"agentType": "critic", "model": settings.critic_model},
    },
    {
        "name": "coder",
        "version": settings.agent_version,
        "owner": settings.agent_owner,
        "capabilities": ["Coding"],
        "concurrency": settings.agent_concurrency,
        "endpoint": settings.agent_runner_endpoint,
        "tags": ["core", "developer", "coder"],
        "metadata": {"agentType": "coder", "model": settings.coding_model},
    },
    {
        "name": "researcher",
        "version": settings.agent_version,
        "owner": settings.agent_owner,
        "capabilities": ["Research"],
        "concurrency": settings.agent_concurrency,
        "endpoint": settings.agent_runner_endpoint,
        "tags": ["core", "researcher"],
        "metadata": {"agentType": "researcher", "model": settings.research_model},
    },
]

# Populated at startup after successful registration
_registered_agent_ids: dict[str, str] = {}  # name → agent_id


async def register_all() -> None:
    """Register all agent types with swarm-api. Retries until all succeed."""
    base = settings.swarm_api_url.rstrip("/")
    url = f"{base}/api/v1/swarm/agents"

    async with httpx.AsyncClient(timeout=30.0) as client:
        for spec in AGENT_SPECS:
            name = spec["name"]
            attempts = 0
            while True:
                attempts += 1
                try:
                    resp = await client.post(url, json=spec)
                    if resp.status_code in (200, 201):
                        agent_id = resp.json().get("id", "unknown")
                        _registered_agent_ids[name] = agent_id
                        log.info("agent.registered", name=name, agent_id=agent_id)
                        break
                    elif resp.status_code == 409:
                        # Already registered — extract existing ID if possible
                        log.info("agent.already_registered", name=name)
                        break
                    else:
                        log.warning(
                            "agent.register_failed",
                            name=name,
                            status=resp.status_code,
                            attempt=attempts,
                        )
                except (httpx.ConnectError, httpx.TimeoutException) as exc:
                    log.warning(
                        "agent.register_error",
                        name=name,
                        error=str(exc),
                        attempt=attempts,
                    )

                if attempts >= 10:
                    log.error("agent.register_giving_up", name=name)
                    break
                await asyncio.sleep(min(2.0 * attempts, 15.0))


async def heartbeat_loop() -> None:
    """Send periodic heartbeats to swarm-api for all registered agents."""
    base = settings.swarm_api_url.rstrip("/")
    interval = settings.heartbeat_interval_seconds

    async with httpx.AsyncClient(timeout=10.0) as client:
        while True:
            await asyncio.sleep(interval)
            for name, agent_id in list(_registered_agent_ids.items()):
                url = f"{base}/api/v1/swarm/agents/{agent_id}/heartbeat"
                try:
                    await client.patch(url, json={"health": "healthy", "activeRuns": 0})
                    log.debug("heartbeat.sent", name=name, agent_id=agent_id)
                except Exception as exc:
                    log.warning("heartbeat.failed", name=name, error=str(exc))
