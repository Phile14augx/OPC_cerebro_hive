"""
Enterprise Architect Agent — Architecture Governance Lead.
Reports to: CEO Agent (Hermes)

Quick start (CrewAI):
    from agents.enterprise_architect.skills import ENTERPRISE_ARCHITECT_SKILLS
    ea = Agent(role="Enterprise Architect", tools=ENTERPRISE_ARCHITECT_SKILLS, ...)

Quick start (HiveSwarm):
    from services.agent_runner.enterprise_architect import EnterpriseArchitectAgent
"""
from agents.enterprise_architect.skills import ENTERPRISE_ARCHITECT_SKILLS  # noqa: F401
