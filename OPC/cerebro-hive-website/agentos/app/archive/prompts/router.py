"""Prompt Library API Router."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.archive.models import PromptTemplate
from app.archive.schemas import PromptCreate, PromptOut, PromptUpdate
from app.db import get_db
from app.platform.auth.keycloak import PlatformUser, get_platform_user

router = APIRouter(prefix="/prompts", tags=["archive:prompts"])


@router.post("", response_model=PromptOut, status_code=201)
def create_prompt(
    payload: PromptCreate,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Create a new prompt template."""
    prompt = PromptTemplate(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        content=payload.content,
        variables=payload.variables,
        tags=payload.tags,
        category=payload.category,
        is_public=payload.is_public,
        org_id=user.org_id,
        created_by=user.user_id,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.get("", response_model=list[PromptOut])
def list_prompts(
    category: str | None = None,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """List prompt templates."""
    q = db.query(PromptTemplate)
    if user.org_id:
        q = q.filter(PromptTemplate.org_id == user.org_id)
    if category:
        q = q.filter(PromptTemplate.category == category)
        
    return q.order_by(PromptTemplate.name.asc()).all()


@router.get("/{prompt_slug}", response_model=PromptOut)
def get_prompt(
    prompt_slug: str,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Get a prompt template by slug."""
    prompt = db.query(PromptTemplate).filter(PromptTemplate.slug == prompt_slug).first()
    if not prompt:
        raise HTTPException(404, "Prompt not found")
    if prompt.org_id and prompt.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
    return prompt


@router.patch("/{prompt_slug}", response_model=PromptOut)
def update_prompt(
    prompt_slug: str,
    payload: PromptUpdate,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> Any:
    """Update a prompt template."""
    prompt = db.query(PromptTemplate).filter(PromptTemplate.slug == prompt_slug).first()
    if not prompt:
        raise HTTPException(404, "Prompt not found")
    if prompt.org_id and prompt.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(prompt, k, v)
        
    prompt.version += 1
    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete("/{prompt_slug}", status_code=204)
def delete_prompt(
    prompt_slug: str,
    db: Session = Depends(get_db),
    user: PlatformUser = Depends(get_platform_user),
) -> None:
    """Delete a prompt template."""
    prompt = db.query(PromptTemplate).filter(PromptTemplate.slug == prompt_slug).first()
    if not prompt:
        raise HTTPException(404, "Prompt not found")
    if prompt.org_id and prompt.org_id != user.org_id:
        raise HTTPException(403, "Access denied")
        
    db.delete(prompt)
    db.commit()
