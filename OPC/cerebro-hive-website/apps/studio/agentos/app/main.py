"""CerebroHive Platform API — Modular Monolith.

Architecture: one FastAPI deployment, organized into domain modules.
Each domain has its own router prefix (/api/<domain>/...) enabling
clean service extraction later without a routing redesign.

Domain Modules:
  /api/platform  — Identity, Auth, Orgs, Billing, Audit
  /api/archive   — CerebroArchive™: Documents, Prompts, Models, Datasets
  /api/runtime   — HivePulse™: Agent Execution, Plans, Tools
  /api/studio    — CerebroStudio™: Prompt Engineering, Evaluation
  /api/flow      — CerebroFlow™: Workflow Automation
  /api/copilot   — CerebroCopilot™: Conversations, Streaming
  /api/insight   — CerebroInsight™: Analytics, Dashboards
  /api/shield    — HiveShield™: Governance, Policies, Compliance
  /api/ops       — HiveOps™: Observability, Deployments

Legacy routes (agentos v1) are maintained at their original paths for
backward compatibility during the migration period.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.middleware import AccessLogMiddleware, RequestGuardMiddleware, SecurityHeadersMiddleware, configure_logging
from app.rate_limit import limiter
from app.db import init_db

# Legacy routers (agentos v1 — maintained for backward compat)
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

# Finance/ERP domain module — real double-entry ledger + automated
# categorize/governance/post pipeline for invoices (app/finance/).
from app.finance import router as finance

configure_logging()
settings = get_settings()


# ─── Lifespan ──────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()

    # Connect to NATS JetStream if configured
    if settings.nats_url:
        from app.core.nats import NATSEventBus, set_nats_bus
        nats_bus = NATSEventBus(settings.nats_url)
        await nats_bus.connect()
        set_nats_bus(nats_bus)

    yield

    # Shutdown
    if settings.nats_url:
        from app.core.nats import get_nats_bus
        bus = get_nats_bus()
        if bus:
            await bus.close()


# ─── App ───────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CerebroHive Platform API",
    description=(
        "Enterprise AI Operating System — modular platform API powering "
        "CerebroArchive™, CerebroStudio™, CerebroFlow™, HivePulse™, "
        "CerebroCopilot™, CerebroInsight™, HiveOps™, and HiveShield™."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Middleware (outermost first — applied in reverse of add order)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestGuardMiddleware)
app.add_middleware(AccessLogMiddleware)


# ─── Meta Endpoints ────────────────────────────────────────────────────────

@app.get("/", tags=["meta"])
def root() -> dict:
    return {
        "platform": "CerebroHive",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "modules": {
            "archive": "/api/archive",
            "runtime": "/api/runtime",
            "studio": "/api/studio",
            "flow": "/api/flow",
            "copilot": "/api/copilot",
            "insight": "/api/insight",
            "shield": "/api/shield",
            "ops": "/api/ops",
            "platform": "/api/platform",
            "finance": "/finance",
        },
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "platform": "cerebrohive"}


# ─── Legacy Routers (agentos v1 — backward compat) ─────────────────────────

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

# Finance/ERP domain module
app.include_router(finance.router)
