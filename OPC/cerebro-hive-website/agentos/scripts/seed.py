"""Seed the AgentOS database with example agents, tools, skills, and a
governance policy — enough to exercise the whole runtime end to end via the
README's curl walkthrough or the pytest smoke tests.

Run with: python scripts/seed.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db import SessionLocal, init_db  # noqa: E402
from app.models.governance import Policy  # noqa: E402
from app.models.marketplace import AgentTemplate  # noqa: E402
from app.models.registry import Agent  # noqa: E402
from app.models.tools import SkillPackage, ToolDefinition  # noqa: E402
from app.core.tools import registry as tool_registry  # noqa: E402

AGENTS_STORE = Path(__file__).resolve().parent.parent / "agents_store"

SKILLS = [
    {"name": "web-research", "description": "Web search + synthesis with citations."},
    {"name": "financial-analysis", "description": "Reconciliation and variance analysis over ledger data."},
    {"name": "customer-support", "description": "Grounded response drafting from a knowledge base."},
]

POLICIES = [
    {
        "name": "finance-approval",
        "description": "Finance-category runs require human approval before executing.",
        "rule": {"if": {"field": "category", "op": "==", "value": "finance"}, "then": "require_approval"},
    },
]


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        # Built-in tools catalog
        for name, tool in tool_registry._tools.items():
            if not db.query(ToolDefinition).filter(ToolDefinition.name == name).first():
                db.add(ToolDefinition(name=name, description=tool.metadata.description, kind="builtin", schema=tool.input_schema, permissions=tool.permissions_required))

        # Skills
        for skill in SKILLS:
            if not db.query(SkillPackage).filter(SkillPackage.name == skill["name"]).first():
                db.add(SkillPackage(name=skill["name"], version="1.0.0", description=skill["description"], config={}))

        # Governance policies
        for policy in POLICIES:
            if not db.query(Policy).filter(Policy.name == policy["name"]).first():
                db.add(Policy(**policy))

        db.commit()

        # Agent templates + live agents from agents_store/*.yaml
        for yaml_path in sorted(AGENTS_STORE.glob("*.yaml")):
            data = yaml.safe_load(yaml_path.read_text())
            slug = data["slug"]

            if not db.query(AgentTemplate).filter(AgentTemplate.slug == slug).first():
                db.add(
                    AgentTemplate(
                        slug=slug,
                        name=data["name"],
                        description=data.get("description", ""),
                        definition={k: v for k, v in data.items() if k != "slug"},
                    )
                )

            if not db.query(Agent).filter(Agent.slug == slug).first():
                db.add(Agent(**data))

        db.commit()
        print("Seeded: tools, skills, policies, agent templates, and live agents.")
        print("Agents:", [a.slug for a in db.query(Agent).all()])
    finally:
        db.close()


if __name__ == "__main__":
    seed()
