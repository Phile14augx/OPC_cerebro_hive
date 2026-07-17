from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core import skills as skills_core
from app.db import get_db
from app.models.identity import APIKey
from app.models.tools import SkillPackage
from app.security import get_current_api_key

router = APIRouter(prefix="/skills", tags=["skills"])


class SkillInstallRequest(BaseModel):
    name: str
    version: str = "1.0.0"
    description: str = ""
    config: dict = {}


class SkillOut(BaseModel):
    id: str
    name: str
    version: str
    description: str
    config: dict
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> list[SkillPackage]:
    return db.query(SkillPackage).order_by(SkillPackage.name).all()


@router.post("/install", response_model=SkillOut, status_code=201)
def install_skill(payload: SkillInstallRequest, db: Session = Depends(get_db), _key: APIKey = Depends(get_current_api_key)) -> SkillPackage:
    return skills_core.install_skill(db, payload.name, payload.version, payload.description, payload.config)
