"""Events SDK — NATS JetStream event bus wrappers with strict schema and versioning."""

from typing import Any
import json
import uuid
import datetime
from app.core.nats import get_nats_bus

class EventEnvelope:
    """Strict schema for all events flowing through the system."""
    def __init__(self, event_type: str, version: str, payload: dict[str, Any], tenant_id: str | None = None, trace_id: str | None = None, correlation_id: str | None = None):
        self.event_id = str(uuid.uuid4())
        self.event_type = event_type
        self.version = version
        self.timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.tenant_id = tenant_id
        self.trace_id = trace_id
        self.correlation_id = correlation_id
        self.payload = payload
        
    def to_dict(self):
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "version": self.version,
            "timestamp": self.timestamp,
            "tenant_id": self.tenant_id,
            "trace_id": self.trace_id,
            "correlation_id": self.correlation_id,
            "payload": self.payload
        }

class EventsSDK:
    def __init__(self):
        self._bus = get_nats_bus()
        
    async def publish(self, subject: str, data: dict[str, Any], version: str = "v1", tenant_id: str = None, trace_id: str = None, correlation_id: str = None) -> None:
        """Publish a strictly schema-enforced event to the NATS JetStream bus."""
        envelope = EventEnvelope(
            event_type=subject,
            version=version,
            payload=data,
            tenant_id=tenant_id,
            trace_id=trace_id,
            correlation_id=correlation_id
        ).to_dict()
        
        # Topic format: archive.pipeline.chunked.v1
        full_subject = f"{subject}.{version}"
        
        if not self._bus:
            import logging
            logging.getLogger("agentos.events").debug(f"Event fallback published to {full_subject}: {envelope}")
            return
            
        await self._bus.publish(full_subject, json.dumps(envelope).encode("utf-8"))
        
    async def subscribe(self, subject: str, version: str, callback: Any) -> None:
        """Subscribe to a versioned subject on the NATS JetStream bus."""
        full_subject = f"{subject}.{version}"
        if self._bus:
            await self._bus.subscribe(full_subject, callback)
