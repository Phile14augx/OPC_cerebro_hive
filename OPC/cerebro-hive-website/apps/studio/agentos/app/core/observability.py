"""Observability: every step of a run is a traceable span, matching the
'distributed tracing for agents' framing in the spec. Shaped to export to
OpenTelemetry/Jaeger directly in production; stored locally here so it works
with zero external collectors.
"""

from __future__ import annotations

import time
from contextlib import contextmanager

from sqlalchemy.orm import Session

from app.models.observability import MetricEvent, TraceSpan


@contextmanager
def span(db: Session, run_id: str, name: str, attributes: dict | None = None):
    start = time.perf_counter()
    status = "ok"
    try:
        yield
    except Exception:
        status = "error"
        raise
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        db.add(
            TraceSpan(
                run_id=run_id,
                name=name,
                status=status,
                attributes=attributes or {},
                duration_ms=duration_ms,
            )
        )
        db.commit()


def record_metric(db: Session, name: str, value: float, run_id: str | None = None, tags: dict | None = None) -> None:
    db.add(MetricEvent(run_id=run_id, name=name, value=value, tags=tags or {}))
    db.commit()
