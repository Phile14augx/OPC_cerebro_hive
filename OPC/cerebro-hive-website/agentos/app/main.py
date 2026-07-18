from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.middleware import AccessLogMiddleware, RequestGuardMiddleware, SecurityHeadersMiddleware, configure_logging
from app.rate_limit import limiter
from app.api.routers import (
    agents,
    auth,
    context,
    cortex,
    governance,
    knowledge,
    marketplace,
    memory,
    observability,
    runtime,
    simulator,
    skills,
    tools,
    workflows,
)
from app.db import init_db

configure_logging()

app = FastAPI(
    title="AgentOS",
    description="Enterprise operating system for AI workers — agent registry, runtime kernel, "
    "memory, tools, knowledge, workflows, governance, and observability.",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Order matters: Starlette applies middleware in reverse of add order (last
# added runs first / outermost). We want, outermost to innermost: access log
# (see everything, including what the guard rejects) -> request guard
# (size/timeout caps, before anything expensive runs) -> security headers
# (stamped on every response, including error responses) -> CORS.
app.add_middleware(CORSMiddleware, allow_origins=get_settings().allowed_origins_list, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestGuardMiddleware)
app.add_middleware(AccessLogMiddleware)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "name": "AgentOS",
        "status": "online",
        "docs": "/docs",
        "subsystems": [
            "identity",
            "registry",
            "runtime",
            "planner",
            "memory",
            "tools",
            "skills",
            "knowledge",
            "context_engine",
            "workflows",
            "governance",
            "observability",
            "cortex",
            "simulator",
            "marketplace",
        ],
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(runtime.router)
app.include_router(memory.router)
app.include_router(tools.router)
app.include_router(skills.router)
app.include_router(knowledge.router)
app.include_router(context.router)
app.include_router(workflows.router)
app.include_router(governance.router)
app.include_router(observability.router)
app.include_router(cortex.router)
app.include_router(simulator.router)
app.include_router(marketplace.router)
