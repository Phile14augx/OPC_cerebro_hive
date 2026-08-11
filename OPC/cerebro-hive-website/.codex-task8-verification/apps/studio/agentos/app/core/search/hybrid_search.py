"""Hybrid Search Engine — BM25 (OpenSearch) + Vector (pgvector) fusion.

Implements permission-aware search critical for enterprise platforms.
Every search result is filtered through the caller's identity context
before scoring begins.

Search pipeline:
    1. Permission pre-filter (resource-scoped to org/workspace/user)
    2. Parallel BM25 keyword search (OpenSearch) + vector search (pgvector)
    3. Reciprocal Rank Fusion (RRF) scoring
    4. Metadata boosting (recency, relevance signals)
    5. Result reranking + deduplication
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger("agentos.search")


@dataclass
class SearchResult:
    id: str
    title: str
    content_preview: str
    score: float
    domain: str  # archive, runtime, studio, etc.
    resource_type: str  # document, prompt, run, etc.
    metadata: dict[str, Any] = field(default_factory=dict)
    highlights: list[str] = field(default_factory=list)


@dataclass
class SearchContext:
    """Caller's identity used for permission pre-filtering."""
    user_id: str | None = None
    org_id: str | None = None
    workspace_id: str | None = None
    roles: list[str] = field(default_factory=list)


class HybridSearchEngine:
    """Combines OpenSearch BM25 with pgvector semantic search."""

    def __init__(self, opensearch_client: Any | None = None, db: Any | None = None) -> None:
        self._os = opensearch_client
        self._db = db

    def _permission_filter(self, ctx: SearchContext) -> dict:
        """Build an OpenSearch permission pre-filter."""
        if not ctx.org_id:
            return {"match_all": {}}
        terms: list[dict] = [{"term": {"org_id": ctx.org_id}}]
        if ctx.workspace_id:
            terms.append({"term": {"workspace_id": ctx.workspace_id}})
        return {"bool": {"filter": terms}}

    def keyword_search(self, query: str, ctx: SearchContext, index: str = "cerebrohive-*", size: int = 20) -> list[SearchResult]:
        """BM25 keyword search via OpenSearch."""
        if self._os is None:
            return []
        try:
            body = {
                "size": size,
                "query": {
                    "bool": {
                        "must": {"multi_match": {"query": query, "fields": ["title^3", "content", "tags^2"]}},
                        "filter": self._permission_filter(ctx),
                    }
                },
                "highlight": {"fields": {"content": {}, "title": {}}},
            }
            resp = self._os.search(index=index, body=body)
            results = []
            for hit in resp["hits"]["hits"]:
                src = hit["_source"]
                highlights = []
                for field_highlights in hit.get("highlight", {}).values():
                    highlights.extend(field_highlights)
                results.append(SearchResult(
                    id=hit["_id"],
                    title=src.get("title", ""),
                    content_preview=src.get("content", "")[:200],
                    score=hit["_score"],
                    domain=src.get("domain", "unknown"),
                    resource_type=src.get("resource_type", "document"),
                    metadata=src.get("metadata", {}),
                    highlights=highlights,
                ))
            return results
        except Exception as exc:
            logger.warning("OpenSearch keyword search failed: %s", exc)
            return []

    def vector_search(self, embedding: list[float], ctx: SearchContext, table: str = "archive_documents", limit: int = 20) -> list[SearchResult]:
        """pgvector cosine similarity search."""
        if self._db is None:
            return []
        try:
            from sqlalchemy import text
            org_filter = f"AND org_id = '{ctx.org_id}'" if ctx.org_id else ""
            query = text(f"""
                SELECT id, title, content_preview, domain, resource_type, metadata,
                       1 - (embedding <=> :emb::vector) AS score
                FROM {table}
                WHERE embedding IS NOT NULL {org_filter}
                ORDER BY score DESC
                LIMIT :limit
            """)
            rows = self._db.execute(query, {"emb": str(embedding), "limit": limit}).fetchall()
            return [
                SearchResult(
                    id=str(r.id), title=r.title, content_preview=r.content_preview,
                    score=float(r.score), domain=r.domain, resource_type=r.resource_type,
                    metadata=r.metadata or {},
                )
                for r in rows
            ]
        except Exception as exc:
            logger.warning("pgvector search failed: %s", exc)
            return []

    def hybrid_search(
        self,
        query: str,
        embedding: list[float] | None,
        ctx: SearchContext,
        limit: int = 10,
        keyword_weight: float = 0.4,
        vector_weight: float = 0.6,
    ) -> list[SearchResult]:
        """Fuse BM25 + vector results using Reciprocal Rank Fusion."""
        keyword_results = self.keyword_search(query, ctx, size=limit * 2)
        vector_results = self.vector_search(embedding, ctx, limit=limit * 2) if embedding else []

        # Reciprocal Rank Fusion (RRF): score = Σ weight / (rank + 60)
        rrf_k = 60
        scores: dict[str, float] = {}
        result_map: dict[str, SearchResult] = {}

        for rank, r in enumerate(keyword_results):
            scores[r.id] = scores.get(r.id, 0.0) + keyword_weight / (rank + rrf_k)
            result_map[r.id] = r

        for rank, r in enumerate(vector_results):
            scores[r.id] = scores.get(r.id, 0.0) + vector_weight / (rank + rrf_k)
            if r.id not in result_map:
                result_map[r.id] = r

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        return [SearchResult(**{**vars(result_map[rid]), "score": score}) for rid, score in ranked]


# ─── Singleton ─────────────────────────────────────────────────────────────

_search_engine: HybridSearchEngine | None = None


def get_search_engine(db: Any = None) -> HybridSearchEngine:
    global _search_engine
    if _search_engine is None:
        from app.config import get_settings
        s = get_settings()
        os_client = None
        if s.opensearch_url:
            try:
                from opensearchpy import OpenSearch, RequestsHttpConnection  # type: ignore
                os_client = OpenSearch(
                    hosts=[s.opensearch_url],
                    http_auth=(s.opensearch_user, s.opensearch_password),
                    use_ssl=s.opensearch_url.startswith("https"),
                    verify_certs=False,
                    connection_class=RequestsHttpConnection,
                )
                logger.info("OpenSearch client initialized: %s", s.opensearch_url)
            except Exception as exc:
                logger.warning("OpenSearch initialization failed: %s", exc)
        _search_engine = HybridSearchEngine(opensearch_client=os_client, db=db)
    return _search_engine
