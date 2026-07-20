"""Retrieval-Augmented Generation (RAG) pipeline with GraphRAG.

Retrieves the most relevant nodes from CerebroArchive and traverses the
Knowledge Graph to pull in connected context, then uses the AI SDK
to generate a grounded, cited answer.

Pipeline:
  1. Embed the query
  2. Vector search nodes (pgvector cosine similarity)
  3. Traverse Knowledge Graph (Node -> Edge -> Related Nodes)
  4. RRF fusion + permission filter
  5. Assemble context prompt
  6. Generate answer via AI SDK
  7. Return answer + sources
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from app.archive.models import Node, Document, Edge
from app.archive.schemas import RAGRequest, RAGResponse

logger = logging.getLogger("agentos.archive.rag")

_SYSTEM_PROMPT = """You are CerebroCopilot™, the AI assistant of the CerebroHive Enterprise AI Platform.
Answer the user's question using ONLY the context provided below.
The context contains knowledge graph nodes (documents, concepts, entities) and their relationships.
If the answer cannot be found in the context, say so clearly.
Always cite the source document title(s) when answering.
Be concise, accurate, and professional."""


def _retrieve_nodes(
    db: Session,
    query_embedding: list[float],
    org_id: str | None,
    top_k: int,
) -> list[tuple[Node, Document, float]]:
    """
    Graph Reasoning Engine (Multi-Hop Traversal):
      1. Vector Search for initial entry points.
      2. Graph Expansion to find related entities, policies, and documents.
      3. Governance Filtering to remove Draft/Deprecated/Unapproved nodes.
      4. Context Ranking via PageRank or Confidence scores.
    """
    from app.core.cerebro_x.embeddings import cosine_similarity
    from app.archive.pipeline.governance import is_knowledge_approved
    import numpy as np

    # Fetch all indexed nodes scoped to the org
    q = db.query(Node, Document).join(Document, Node.document_id == Document.id, isouter=True)
    if org_id:
        q = q.filter(Node.org_id == org_id)
    q = q.filter(Node.embedding.isnot(None))

    rows = q.all()
    if not rows:
        return []

    # 1. Initial Vector Search
    scored: list[tuple[Node, Document, float]] = []
    for node, doc in rows:
        if node.embedding:
            score = cosine_similarity(query_embedding, node.embedding)
            if score > 0.7:  # Initial threshold
                scored.append((node, doc, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    top_seeds = scored[:top_k]
    
    # 2. Graph Expansion (1-hop)
    expanded_context = set()
    final_nodes = []
    
    for seed_node, seed_doc, score in top_seeds:
        if not is_knowledge_approved(seed_node):
            continue
            
        final_nodes.append((seed_node, seed_doc, score))
        expanded_context.add(seed_node.id)
        
        # Pull incoming and outgoing edges
        for edge in seed_node.outgoing_edges:
            target = edge.target
            if target.id not in expanded_context and is_knowledge_approved(target):
                expanded_context.add(target.id)
                final_nodes.append((target, target.document, score * edge.confidence * 0.9)) # decay
                
        for edge in seed_node.incoming_edges:
            source = edge.source
            if source.id not in expanded_context and is_knowledge_approved(source):
                expanded_context.add(source.id)
                final_nodes.append((source, source.document, score * edge.confidence * 0.9)) # decay
                
    # 3. Context Ranking
    final_nodes.sort(key=lambda x: x[2], reverse=True)
    return final_nodes[:top_k * 2] # Return expanded graph context


def rag(db: Session, request: RAGRequest) -> RAGResponse:
    """Run the full RAG pipeline and return an answer with cited sources."""
    from app.archive.pipeline.embedder import embed_text
    from app.core.cerebro_x import gateway

    # 1. Embed the query
    emb_result = embed_text(request.query)
    query_vector = emb_result.vector

    # 2. Retrieve relevant nodes
    retrieved = _retrieve_nodes(
        db, query_vector, org_id=request.org_id, top_k=request.top_k
    )

    if not retrieved:
        return RAGResponse(
            answer="I could not find any relevant information in the knowledge base for your query.",
            sources=[],
            model=request.model,
            query=request.query,
        )

    # 3. Assemble context
    context_parts: list[str] = []
    sources: list[dict] = []
    seen_docs: set[str] = set()

    for node, doc, score in retrieved:
        context_parts.append(f"[Source: {doc.title}]\n{node.content}")
        if doc.id not in seen_docs and request.include_sources:
            sources.append({
                "document_id": doc.id,
                "title": doc.title,
                "domain": doc.domain,
                "node_id": node.id,
                "relevance_score": round(score, 4),
            })
            seen_docs.add(doc.id)

    context = "\n\n---\n\n".join(context_parts)
    user_prompt = f"Context:\n{context}\n\nQuestion: {request.query}"

    # 4. Generate answer via Cerebro X
    try:
        response = gateway.complete(
            system=_SYSTEM_PROMPT,
            prompt=user_prompt,
            model=request.model if request.model != "default" else None,
            temperature=0.3,
        )
        answer = response.text
        model_used = response.model
    except Exception as exc:
        logger.warning("RAG generation failed: %s", exc)
        # Fallback: return the most relevant node directly
        best_node = retrieved[0][0]
        answer = best_node.content
        model_used = "fallback/direct-node"

    return RAGResponse(
        answer=answer,
        sources=sources,
        model=model_used,
        query=request.query,
    )
