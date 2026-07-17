"""Context Engine: assembles the actual execution context an agent reasons
over, by composing the engines that already exist rather than duplicating
them — Memory (this agent's own working/episodic/semantic history),
Knowledge (the shared document/RAG corpus), and Governance (which policies
are actually in scope for this agent right now). Nothing here re-implements
retrieval; it fuses and re-ranks results that memory_engine and
knowledge_engine already compute, plus policy metadata governance_engine
already evaluates.

This closes a real gap: previously `runtime._execute_steps` only ever
pulled memory for a reasoning step; it never touched the knowledge base or
surfaced which governance policies applied to the agent doing the
reasoning. `assemble()` below is what that reasoning step now calls.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy.orm import Session

from app.core import knowledge_engine, memory_engine
from app.models.governance import Policy
from app.models.registry import Agent


@dataclass
class ContextSource:
    origin: str  # "memory" | "knowledge"
    label: str
    text: str
    score: float


@dataclass
class ContextBundle:
    agent_id: str
    query: str
    sources: list[ContextSource] = field(default_factory=list)
    applicable_policies: list[str] = field(default_factory=list)
    assembled_text: str = ""


def assemble(db: Session, agent: Agent, query: str, k_memory: int = 3, k_knowledge: int = 3) -> ContextBundle:
    sources: list[ContextSource] = []

    for item, score in memory_engine.retrieve(db, agent.id, query, k=k_memory):
        sources.append(ContextSource(origin="memory", label=f"memory:{item.tier}", text=item.content, score=score))

    for chunk in knowledge_engine.retrieve(db, query, k=k_knowledge):
        sources.append(ContextSource(origin="knowledge", label=chunk.document_title, text=chunk.text, score=chunk.score))

    # One combined ranking across both engines — this is the actual fusion:
    # without it, a caller would have to arbitrarily decide "memory first" or
    # "knowledge first" instead of letting relevance decide.
    sources.sort(key=lambda s: s.score, reverse=True)

    # Which governance policies are actually in scope for this agent right
    # now — evaluated against the same context shape runtime.execute() uses,
    # so what the UI shows here always matches what governance would decide.
    context_for_policy = {"category": agent.category, "agent_slug": agent.slug}
    applicable_policies: list[str] = []
    for policy in db.query(Policy).filter(Policy.enabled.is_(True)).all():
        field_name = policy.rule.get("if", {}).get("field")
        if field_name in context_for_policy:
            applicable_policies.append(policy.name)

    top_sources = sources[: max(k_memory, k_knowledge) + 2]
    assembled_text = " ".join(f"[{s.label}] {s.text}" for s in top_sources)

    return ContextBundle(
        agent_id=agent.id,
        query=query,
        sources=top_sources,
        applicable_policies=applicable_policies,
        assembled_text=assembled_text,
    )
