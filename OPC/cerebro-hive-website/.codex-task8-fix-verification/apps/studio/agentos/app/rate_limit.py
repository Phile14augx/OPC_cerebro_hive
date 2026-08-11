"""Rate limiting via slowapi (in-memory, per-process — same caveat as the
website's lib/security/rateLimit.ts: correct for a single instance, needs a
shared backend (Redis) once this is horizontally scaled to multiple
processes/replicas. See the security roadmap doc.

Two layers:
  - A global default applied to every route (defense in depth against
    anything not explicitly tuned below).
  - Tighter, explicit limits on the two most sensitive endpoints:
    key issuance (POST /auth/api-keys) and task execution (POST
    /runtime/execute), since that's real compute per call.

Keyed by client IP (get_remote_address, which respects X-Forwarded-For when
the app is behind a proxy — matches the CORS/allowlist model already in
place). A future upgrade could key by API key instead of IP for authenticated
routes, so one caller can't be starved by a noisy neighbor sharing a NAT.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
