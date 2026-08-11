"""Memory Engine: working / short-term / long-term / semantic / episodic /
procedural tiers, backed by SQL rows + local vector similarity (swap for
Postgres + pgvector in production for real ANN search at scale).

Operations: remember, forget, retrieve, summarize.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.cerebro_x.embeddings import cosine_similarity, embed
from app.models.memory import MemoryItem

TIERS = ("working", "short_term", "long_term", "semantic", "episodic", "procedural")


def remember(db: Session, agent_id: str, content: str, tier: str = "working", run_id: str | None = None, meta: dict | None = None) -> MemoryItem:
    item = MemoryItem(
        agent_id=agent_id,
        run_id=run_id,
        tier=tier,
        content=content,
        embedding=embed(content),
        meta=meta or {},
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def forget(db: Session, memory_id: str) -> bool:
    item = db.query(MemoryItem).filter(MemoryItem.id == memory_id).first()
    if item is None:
        return False
    db.delete(item)
    db.commit()
    return True


def retrieve(db: Session, agent_id: str, query: str, tier: str | None = None, k: int = 5) -> list[tuple[MemoryItem, float]]:
    q = db.query(MemoryItem).filter(MemoryItem.agent_id == agent_id)
    if tier:
        q = q.filter(MemoryItem.tier == tier)
    items = q.all()

    query_vec = embed(query)
    scored = [(item, cosine_similarity(query_vec, item.embedding)) for item in items]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored[:k]


def summarize(items: list[MemoryItem], max_chars: int = 600) -> str:
    """Naive extractive summary — concatenate + truncate. Production swap-in:
    an LLM-based summarization pass through the LLM Gateway.
    """
    joined = " • ".join(item.content for item in items)
    return joined[:max_chars]
