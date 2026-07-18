from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core import memory_engine
from app.db import get_db
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/memory", tags=["memory"])


class RememberRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agent_id: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=50_000)
    tier: str = Field(default="working", max_length=50)
    meta: dict = Field(default_factory=dict)


class MemoryOut(BaseModel):
    id: str
    agent_id: str
    tier: str
    content: str
    meta: dict
    created_at: datetime
    score: float | None = None

    class Config:
        from_attributes = True


@router.post("", response_model=MemoryOut, status_code=201)
def remember(payload: RememberRequest, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)):
    if payload.tier not in memory_engine.TIERS:
        raise HTTPException(400, f"tier must be one of {memory_engine.TIERS}")
    item = memory_engine.remember(db, payload.agent_id, payload.content, tier=payload.tier, meta=payload.meta)
    return MemoryOut.model_validate(item)


@router.get("", response_model=list[MemoryOut])
def query_memory(
    agent_id: str,
    q: str = "",
    tier: str | None = None,
    k: int = 5,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
):
    results = memory_engine.retrieve(db, agent_id, q, tier=tier, k=k)
    out = []
    for item, score in results:
        payload = MemoryOut.model_validate(item)
        payload.score = round(score, 4)
        out.append(payload)
    return out


@router.delete("/{memory_id}", status_code=204)
def delete_memory(memory_id: str, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> None:
    if not memory_engine.forget(db, memory_id):
        raise HTTPException(404, "memory item not found")
