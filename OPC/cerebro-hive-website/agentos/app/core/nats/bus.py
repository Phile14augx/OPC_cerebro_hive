"""NATS JetStream event bus adapter.

Provides a drop-in replacement for the in-process EventBus when
NATS_URL is configured. Falls back to in-process pub/sub (the existing
EventBus) when NATS is not available — this keeps tests green without
requiring a running NATS server.

Subject naming convention (standardized):
  platform.user.created
  platform.org.created
  archive.document.ingested
  archive.embedding.created
  runtime.run.started
  runtime.run.completed
  runtime.tool.started
  runtime.tool.finished
  flow.workflow.started
  flow.workflow.completed
  copilot.chat.completed
  security.policy.violated
  observability.metric.recorded
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections.abc import Callable
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger("agentos.nats")

# ------------------------------------------------------------------
# Subject naming helpers
# ------------------------------------------------------------------

def subject(domain: str, entity: str, action: str) -> str:
    """Build a canonical NATS subject string.

    E.g.:  subject("archive", "document", "ingested")
           → "archive.document.ingested"
    """
    return f"{domain}.{entity}.{action}"


# Map legacy in-process event_type strings to NATS subjects.
_LEGACY_TO_SUBJECT: dict[str, str] = {
    "run.started":               "runtime.run.started",
    "run.completed":             "runtime.run.completed",
    "run.blocked":               "runtime.run.blocked",
    "run.pending_approval":      "runtime.run.pending_approval",
    "planner_step":              "runtime.planner.step",
    "tool_started":              "runtime.tool.started",
    "tool_finished":             "runtime.tool.finished",
    "reasoning":                 "runtime.llm.response",
    "error":                     "runtime.error",
    "workflow.paused_for_approval": "flow.workflow.paused",
    "workflow.finished":         "flow.workflow.completed",
    "mesh.delegated":            "runtime.mesh.delegated",
    "mesh.delegate_pending_approval": "runtime.mesh.pending_approval",
    "mesh.consensus_reached":    "runtime.mesh.consensus",
}


def normalize_subject(event_type: str) -> str:
    """Convert legacy event_type to canonical NATS subject."""
    return _LEGACY_TO_SUBJECT.get(event_type, event_type.replace(".", "_"))


# ------------------------------------------------------------------
# NATS Adapter (async)
# ------------------------------------------------------------------

class NATSEventBus:
    """Async NATS JetStream publisher/subscriber.

    Usage:
        bus = NATSEventBus(nats_url="nats://localhost:4222")
        await bus.connect()
        await bus.publish("archive.document.ingested", {"doc_id": "..."})
        await bus.subscribe("runtime.run.*", handler)
        await bus.close()
    """

    def __init__(self, nats_url: str) -> None:
        self._url = nats_url
        self._nc: Any = None
        self._js: Any = None
        self._subscriptions: list = []

    async def connect(self) -> None:
        try:
            import nats  # type: ignore
            self._nc = await nats.connect(self._url)
            self._js = self._nc.jetstream()
            logger.info("Connected to NATS at %s", self._url)
        except Exception as exc:  # noqa: BLE001
            logger.warning("NATS connection failed (%s) — falling back to in-process bus", exc)
            self._nc = None
            self._js = None

    async def publish(self, subject_str: str, payload: dict) -> None:
        if self._js is None:
            return
        data = json.dumps({
            **payload,
            "_subject": subject_str,
            "_ts": datetime.now(timezone.utc).isoformat(),
        }).encode()
        try:
            await self._js.publish(subject_str, data)
        except Exception as exc:  # noqa: BLE001
            logger.warning("NATS publish failed for subject %s: %s", subject_str, exc)

    async def subscribe(self, subject_pattern: str, handler: Callable[[str, dict], None]) -> None:
        if self._js is None:
            return
        try:
            import nats  # type: ignore
            sub = await self._js.subscribe(subject_pattern)
            self._subscriptions.append(sub)

            async def _listen() -> None:
                async for msg in sub.messages:
                    try:
                        data = json.loads(msg.data.decode())
                        handler(msg.subject, data)
                        await msg.ack()
                    except Exception as exc:  # noqa: BLE001
                        logger.warning("NATS message handler error: %s", exc)

            asyncio.create_task(_listen())
        except Exception as exc:  # noqa: BLE001
            logger.warning("NATS subscribe failed for %s: %s", subject_pattern, exc)

    async def close(self) -> None:
        if self._nc:
            await self._nc.close()


# ------------------------------------------------------------------
# Sync bridge — wraps the existing in-process EventBus, additionally
# publishing to NATS when available. This keeps the synchronous
# runtime.py / workflow_engine.py unchanged.
# ------------------------------------------------------------------

_nats_bus: NATSEventBus | None = None


def get_nats_bus() -> NATSEventBus | None:
    return _nats_bus


def set_nats_bus(bus: NATSEventBus) -> None:
    global _nats_bus
    _nats_bus = bus


def publish_to_nats(event_type: str, payload: dict) -> None:
    """Fire-and-forget NATS publish from sync code."""
    bus = get_nats_bus()
    if bus is None:
        return
    nats_subject = normalize_subject(event_type)
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(bus.publish(nats_subject, payload))
    except RuntimeError:
        pass  # No event loop — skip NATS in sync contexts like tests
