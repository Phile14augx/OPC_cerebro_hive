from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.identity import APIKey
from app.models.marketplace import AgentTemplate, Installation
from app.models.registry import Agent
from app.security import get_current_api_key

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


class TemplateOut(BaseModel):
    slug: str
    name: str
    description: str
    rating: float

    class Config:
        from_attributes = True


class InstallRequest(BaseModel):
    as_slug: str | None = None


@router.get("/templates", response_model=list[TemplateOut])
def list_templates(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[AgentTemplate]:
    return db.query(AgentTemplate).all()


@router.post("/install/{slug}")
def install_template(
    slug: str,
    payload: InstallRequest,
    db: Session = Depends(get_db),
    _key: APIKey = Depends(get_current_api_key),
) -> dict:
    template = db.query(AgentTemplate).filter(AgentTemplate.slug == slug).first()
    if template is None:
        raise HTTPException(404, f"template '{slug}' not found")

    new_slug = payload.as_slug or f"{slug}-{db.query(Installation).filter(Installation.template_slug == slug).count() + 1}"
    if db.query(Agent).filter(Agent.slug == new_slug).first():
        raise HTTPException(409, f"agent '{new_slug}' already exists")

    agent = Agent(slug=new_slug, **{k: v for k, v in template.definition.items() if k != "slug"})
    db.add(agent)
    db.commit()
    db.refresh(agent)

    db.add(Installation(template_slug=slug, agent_id=agent.id))
    db.commit()

    return {"installed_agent_slug": agent.slug, "agent_id": agent.id}
