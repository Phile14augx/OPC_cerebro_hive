"""Cross-cutting request middleware: security headers, hard request-size/timeout
caps, and structured (JSON-lines) request logging.

These sit alongside the existing auth (app/security.py) and CORS (app/main.py)
layers. None of this replaces a real WAF/edge layer (Cloudflare etc.) — it's
the set of controls that are meaningfully enforceable from inside the app
itself, so the service isn't relying purely on infrastructure that may or may
not be in front of it yet. See the security roadmap doc for what's still an
infra/vendor decision rather than code.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from typing import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import get_settings

logger = logging.getLogger("agentos.access")
security_logger = logging.getLogger("agentos.security")


def configure_logging() -> None:
    """Structured (JSON-per-line) logging so this is directly ingestible by a
    SIEM / log aggregator (Cloudflare Logs, Datadog, whatever's downstream) —
    see the security roadmap doc, sections 19/21. Uses stdlib logging rather
    than an extra dependency; a JSON formatter is enough for this MVP.
    """

    class JsonFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            payload = {
                "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
            }
            extra = getattr(record, "extra_fields", None)
            if extra:
                payload.update(extra)
            return json.dumps(payload, default=str)

    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())

    for name in ("agentos.access", "agentos.security"):
        log = logging.getLogger(name)
        log.handlers = [handler]
        log.setLevel(logging.INFO)
        log.propagate = False


def _log(log: logging.Logger, message: str, **fields: object) -> None:
    log.info(message, extra={"extra_fields": fields})


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds the header set this API can meaningfully own from inside the app.
    CSP is intentionally omitted here — this is a JSON API, not an HTML
    document, so a document-oriented CSP doesn't apply the way it does on the
    Next.js frontend (see middleware.ts there).
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cross-Origin-Resource-Policy"] = "same-site"
        response.headers.setdefault("Cache-Control", "no-store")
        if get_settings().is_production:
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        # Don't advertise the exact server/framework version to opportunistic scanners.
        if "server" in response.headers:
            del response.headers["server"]
        return response


class RequestGuardMiddleware(BaseHTTPMiddleware):
    """Hard caps every request must satisfy before it reaches routing logic:
    a maximum body size (rejects oversized payloads with 413 before they're
    buffered/parsed) and a maximum wall-clock time to produce a response
    (protects against a slow handler — e.g. a pathological Cortex/Simulator
    request — tying up a worker indefinitely).
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        settings = get_settings()

        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                if int(content_length) > settings.agentos_max_body_bytes:
                    return JSONResponse({"detail": "Request body too large"}, status_code=413)
            except ValueError:
                pass

        try:
            return await asyncio.wait_for(call_next(request), timeout=settings.agentos_request_timeout_seconds)
        except asyncio.TimeoutError:
            _log(security_logger, "request_timeout", path=request.url.path, method=request.method)
            return JSONResponse({"detail": "Request timed out"}, status_code=504)


class AccessLogMiddleware(BaseHTTPMiddleware):
    """Structured per-request access log, plus a dedicated security-event log
    line for any 401/403 response — the raw signal a later brute-force /
    credential-stuffing detector (section 20) would consume. This is separate
    from the business-level AuditLog table (app/models/governance.py), which
    records *what changed*, not *every request that hit the API*.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
            request.client.host if request.client else "unknown"
        )

        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers["X-Request-Id"] = request_id

        _log(
            logger,
            "request",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            client_ip=client_ip,
        )

        if response.status_code in (401, 403, 429):
            _log(
                security_logger,
                "auth_or_rate_limit_rejection",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                client_ip=client_ip,
            )

        return response
