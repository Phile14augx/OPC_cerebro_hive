"""Skills: versioned, installable capability packages. In this MVP a skill is
a named, versioned config blob (e.g. prompt fragments + preferred tools) that
gets merged into an agent's context at plan time — real logic lives in the
tools/prompts it references rather than in arbitrary uploaded code, which
keeps the skill system safe to run without a code-execution sandbox per
skill.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.tools import SkillPackage


def install_skill(db: Session, name: str, version: str, description: str, config: dict) -> SkillPackage:
    existing = db.query(SkillPackage).filter(SkillPackage.name == name, SkillPackage.version == version).first()
    if existing:
        return existing
    skill = SkillPackage(name=name, version=version, description=description, config=config)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def get_latest(db: Session, name: str) -> SkillPackage | None:
    return (
        db.query(SkillPackage)
        .filter(SkillPackage.name == name)
        .order_by(SkillPackage.created_at.desc())
        .first()
    )


def load_skills(db: Session, names: list[str]) -> list[SkillPackage]:
    return [s for s in (get_latest(db, name) for name in names) if s is not None]
