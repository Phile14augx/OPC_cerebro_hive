"""Event System + Communication Bus.

In-process pub/sub, persisted to an append-only event log (event sourcing).
Production swap-in: NATS JetStream — the `publish`/`subscribe` call shapes
here map directly onto NATS subjects via the nats adapter, so the swap is
transparent. When NATS_URL is configured, every publish is dual-sent to both
the in-process handlers and NATS JetStream.
"""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Callable
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.observability import EventLogEntry

Subscriber = Callable[[str, dict], None]


class EventBus:
    def __init__(self) -> None:
        self._subscribers: dict[str, list[Subscriber]] = defaultdict(list)

    def subscribe(self, event_type: str, handler: Subscriber) -> None:
        self._subscribers[event_type].append(handler)

    def publish(self, db: Session, event_type: str, payload: dict, run_id: str | None = None) -> None:
        entry = EventLogEntry(run_id=run_id, event_type=event_type, payload=payload)
        db.add(entry)
        db.commit()

        # In-process handlers (WebSocket streaming, test assertions, etc.)
        for handler in self._subscribers.get(event_type, []):
            handler(event_type, payload)
        for handler in self._subscribers.get("*", []):
            handler(event_type, payload)

        # Dual-publish to NATS JetStream when available (non-blocking)
        try:
            from app.core.nats import publish_to_nats
            publish_to_nats(event_type, {**payload, "run_id": run_id})
        except Exception:  # noqa: BLE001
            pass  # NATS is optional — never crash the in-process flow


bus = EventBus()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
