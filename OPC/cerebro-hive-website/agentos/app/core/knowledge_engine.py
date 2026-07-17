"""Knowledge System: ingest -> chunk -> embed -> retrieve -> cite (RAG).

Local embeddings + cosine similarity by default (see embeddings.py);
production swap-in is a real embedding model + pgvector/OpenSearch for
hybrid lexical+semantic search over documents pulled from Confluence,
SharePoint, GitHub, Notion, etc.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.core.embeddings import cosine_similarity, embed
from app.models.knowledge import Chunk, Document

CHUNK_SIZE = 400


def ingest(db: Session, title: str, content: str, source: str = "upload", meta: dict | None = None) -> Document:
    doc = Document(title=title, source=source, content=content, meta=meta or {})
    db.add(doc)
    db.commit()
    db.refresh(doc)

    for i, start in enumerate(range(0, len(content), CHUNK_SIZE)):
        text = content[start : start + CHUNK_SIZE]
        db.add(Chunk(document_id=doc.id, ordinal=i, text=text, embedding=embed(text)))
    db.commit()

    return doc


@dataclass
class RetrievedChunk:
    document_id: str
    document_title: str
    text: str
    score: float


def retrieve(db: Session, query: str, k: int = 5) -> list[RetrievedChunk]:
    chunks = db.query(Chunk).all()
    if not chunks:
        return []

    query_vec = embed(query)
    doc_titles = {d.id: d.title for d in db.query(Document).all()}

    scored = [(chunk, cosine_similarity(query_vec, chunk.embedding)) for chunk in chunks]
    scored.sort(key=lambda pair: pair[1], reverse=True)

    return [
        RetrievedChunk(
            document_id=chunk.document_id,
            document_title=doc_titles.get(chunk.document_id, "unknown"),
            text=chunk.text,
            score=score,
        )
        for chunk, score in scored[:k]
    ]


def cite(results: list[RetrievedChunk]) -> str:
    return "; ".join(f"[{r.document_title}] {r.text[:80].strip()}..." for r in results)
