"""Search API Router — Hybrid Search and RAG endpoints."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.archive.pipeline.embedder import embed_text
from app.archive.pipeline.rag import rag
from app.archive.schemas import RAGRequest, RAGResponse, SearchRequest, SearchResponse
from app.core.search.hybrid_search import SearchContext, get_search_engine
from app.db import get_db
from app.platform.auth.keycloak import PlatformUser, get_platform_user

router = APIRouter(prefix="/search", tags=["archive:search"])


@router.post("", response_model=SearchResponse)
def hybrid_search(
    request: SearchRequest,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Perform hybrid BM25 + Vector search across CerebroArchive."""
    engine = get_search_engine(db=db)
    
    ctx = SearchContext(
        user_id=user.user_id,
        org_id=user.org_id,
        workspace_id=request.workspace_id,
        roles=user.roles,
    )
    
    vector = None
    search_type = "keyword"
    if request.vector_weight > 0:
        emb_result = embed_text(request.query)
        vector = emb_result.vector
        search_type = "hybrid" if request.keyword_weight > 0 else "vector"
        
    results = engine.hybrid_search(
        query=request.query,
        embedding=vector,
        ctx=ctx,
        limit=request.limit,
        keyword_weight=request.keyword_weight,
        vector_weight=request.vector_weight,
    )
    
    # Filter by domain/resource_type if requested
    if request.domains:
        results = [r for r in results if r.domain in request.domains]
    if request.resource_types:
        results = [r for r in results if r.resource_type in request.resource_types]
        
    return SearchResponse(
        query=request.query,
        results=results,
        total=len(results),
        search_type=search_type,
    )


@router.post("/rag", response_model=RAGResponse)
def rag_query(
    request: RAGRequest,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Answer a query using Retrieval-Augmented Generation (RAG)."""
    # Enforce org_id from token
    request.org_id = user.org_id
    return rag(db, request)
