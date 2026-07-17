from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import knowledge_engine
from app.db import get_db
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class IngestRequest(BaseModel):
    title: str
    content: str
    source: str = "upload"
    meta: dict = {}


class IngestResponse(BaseModel):
    document_id: str
    chunks: int


class SearchResult(BaseModel):
    document_id: str
    document_title: str
    text: str
    score: float


@router.post("/documents", response_model=IngestResponse, status_code=201)
def ingest_document(payload: IngestRequest, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> IngestResponse:
    doc = knowledge_engine.ingest(db, payload.title, payload.content, source=payload.source, meta=payload.meta)
    chunk_count = -(-len(payload.content) // knowledge_engine.CHUNK_SIZE)
    return IngestResponse(document_id=doc.id, chunks=chunk_count)


@router.get("/search", response_model=list[SearchResult])
def search(q: str, k: int = 5, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[SearchResult]:
    results = knowledge_engine.retrieve(db, q, k=k)
    return [
        SearchResult(document_id=r.document_id, document_title=r.document_title, text=r.text, score=round(r.score, 4))
        for r in results
    ]
