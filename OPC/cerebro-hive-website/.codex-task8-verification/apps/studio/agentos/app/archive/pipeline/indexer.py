"""Archive Indexer — event-driven ingestion pipeline.

Stages:
  1. Parse -> 2. Chunk -> 3. Entity Extractor -> 4. Taxonomy Classifier -> 
  5. Relationship Detector -> 6. Metadata Enricher -> 7. Embedding Generator -> 
  8. Knowledge Graph Writer -> 9. Search Indexer

Each stage publishes an event to NATS JetStream.
"""

from __future__ import annotations

import logging
import asyncio
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.archive.models import Node, Document
from app.archive.pipeline.chunker import chunk
from app.archive.pipeline.embedder import embed_batch
from app.archive.pipeline.parser import parse
from app.core.sdk.platform import platform

logger = logging.getLogger("agentos.archive.indexer")


def ingest(
    db: Session,
    document: Document,
    raw_content: str | bytes | None = None,
    chunking_strategy: str = "fixed",
    max_tokens: int = 512,
) -> Document:
    """Entry point for ingestion. Starts the event-driven pipeline."""
    document.status = "processing"
    db.commit()

    # In a fully event-driven architecture, this would just publish an event:
    # platform.events.publish("archive.document.created", {"doc_id": document.id})
    # and workers would pick it up. For simplicity, we'll execute the stages here synchronously
    # and publish lifecycle events.
    
    # ── 1. Parse ──────────────────────────────────────────────────────────
    content_text = document.content or ""
    if raw_content or document.source_url:
        result = parse(
            content=raw_content,
            file_type=document.file_type or "text",
            source_url=document.source_url if not raw_content else None,
        )
        if result.success and result.text:
            content_text = result.text
            document.content = content_text
            document.file_type = result.file_type
        elif not result.success:
            logger.warning("Parse failed for doc %s: %s", document.id, result.error)

    if not content_text.strip():
        document.status = "failed"
        document.meta = {**document.meta, "ingest_error": "no extractable content"}
        db.commit()
        return document
        
    try:
        # Fire-and-forget event
        asyncio.create_task(platform.events.publish("archive.pipeline.parsed", {"doc_id": document.id}))
    except Exception:
        pass

    # ── 2. Chunk ──────────────────────────────────────────────────────────
    text_chunks = chunk(content_text, strategy=chunking_strategy, max_tokens=max_tokens)
    if not text_chunks:
        document.status = "failed"
        document.meta = {**document.meta, "ingest_error": "chunker produced no chunks"}
        db.commit()
        return document
        
    try:
        asyncio.create_task(platform.events.publish("archive.pipeline.chunked", {"doc_id": document.id, "chunks": len(text_chunks)}))
    except Exception:
        pass
        
    # ── 3-6. AI Enrichments (Placeholder for SDK calls) ───────────────────
    # entity_extractor(document, text_chunks)
    # taxonomy_classifier(document)
    # relationship_detector(document, text_chunks)
    # metadata_enricher(document)

    # ── 7. Embed ──────────────────────────────────────────────────────────
    texts = [c.content for c in text_chunks]
    embeddings = embed_batch(texts)
    
    try:
        asyncio.create_task(platform.events.publish("archive.pipeline.embedded", {"doc_id": document.id}))
    except Exception:
        pass

    # ── 8. Knowledge Graph Writer ─────────────────────────────────────────
    # Delete any old nodes for this document
    db.query(Node).filter(Node.document_id == document.id).delete()

    for tc, emb in zip(text_chunks, embeddings):
        db.add(Node(
            document_id=document.id,
            org_id=document.org_id,
            type="chunk",
            name=f"{document.title} (Chunk {tc.chunk_index})",
            content=tc.content,
            embedding=emb.vector,
            provenance={
                "source_document": document.id,
                "chunk_index": tc.chunk_index,
                "token_count": tc.token_count,
                "parser_version": "1.0",
                "embedding_model": emb.model
            },
            meta={"strategy": chunking_strategy},
        ))

        try:
            asyncio.create_task(platform.events.publish("archive.pipeline.graph_written", {"doc_id": document.id}))
        except Exception:
            pass

    # ── 9. Search Indexer ─────────────────────────────────────────────────
    _index_to_opensearch(document, content_text)
    
    try:
        asyncio.create_task(platform.events.publish("archive.pipeline.indexed", {"doc_id": document.id}))
    except Exception:
        pass

    document.status = "indexed"
    document.node_count = len(text_chunks)
    document.meta = {
        **document.meta,
        "indexed_at": datetime.now(timezone.utc).isoformat(),
        "node_count": len(text_chunks),
        "chunking_strategy": chunking_strategy,
    }
    db.commit()
    db.refresh(document)

    logger.info("Ingested doc %s: %d nodes, status=indexed", document.id, len(text_chunks))
    return document

def _index_to_opensearch(document: Document, text: str) -> None:
    """Push document metadata + text to OpenSearch for BM25 keyword search."""
    try:
        from app.core.search.hybrid_search import get_search_engine
        engine = get_search_engine()
        if engine._os is None:
            return  # OpenSearch not configured — skip

        body = {
            "id": document.id,
            "org_id": document.org_id or "",
            "workspace_id": document.workspace_id or "",
            "title": document.title,
            "content": text[:10_000],  # OpenSearch field size limit
            "domain": document.domain,
            "resource_type": document.resource_type,
            "tags": document.tags,
            "metadata": document.meta,
            "is_public": document.is_public,
            "indexed_at": datetime.now(timezone.utc).isoformat(),
        }
        engine._os.index(index="cerebrohive-archive", id=document.id, body=body)
    except Exception as exc:
        logger.warning("OpenSearch indexing failed for doc %s: %s", document.id, exc)
