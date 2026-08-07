"""
Project Manager Agent — Program Delivery Lead.
Reports to: CEO Agent (Hermes)

Quick start (CrewAI):
    from agents.project_manager.skills import PROJECT_MANAGER_SKILLS
    pm = Agent(role="Project Manager", tools=PROJECT_MANAGER_SKILLS, ...)

Quick start (HiveSwarm):
    from services.agent_runner.project_manager import ProjectManagerAgent
"""
from agents.project_manager.skills import PROJECT_MANAGER_SKILLS  # noqa: F401
