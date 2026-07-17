from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

app = FastAPI(
    title="AgentOS",
    description="Enterprise operating system for AI workers — agent registry, runtime kernel, "
    "memory, tools, knowledge, workflows, governance, and observability.",
    version="0.1.0",
)

# Local dev only: lets the CerebroHive website's live-runtime page (running on
# localhost:3000) call this API directly from the browser. Lock this down to
# specific origins before deploying anywhere real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
