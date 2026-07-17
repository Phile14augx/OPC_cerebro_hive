from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core import context_engine
from app.db import get_db
from app.models.identity import APIKey
from app.models.registry import Agent
from app.security import get_current_api_key

router = APIRouter(prefix="/context", tags=["context"])


@router.get("/assemble")
def assemble_context(
    agent_slug: str,
    q: str,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> dict:
    """Preview exactly what the Context Engine would hand the reasoning step
    for this agent + query right now — same function runtime.py calls."""
    agent = db.query(Agent).filter(Agent.slug == agent_slug).first()
    if agent is None:
        raise HTTPException(404, f"agent '{agent_slug}' not found")

    bundle = context_engine.assemble(db, agent, q)
    return {
        "agent_id": bundle.agent_id,
        "agent_slug": agent.slug,
        "query": bundle.query,
        "sources": [
            {"origin": s.origin, "label": s.label, "text": s.text, "score": round(s.score, 4)}
            for s in bundle.sources
        ],
        "applicable_policies": bundle.applicable_policies,
        "assembled_text": bundle.assembled_text,
    }
