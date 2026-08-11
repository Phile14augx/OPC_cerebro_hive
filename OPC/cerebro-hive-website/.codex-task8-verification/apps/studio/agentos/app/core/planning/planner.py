"""Planning Engine — Router, Rule-Based, and LLM-Assisted Planners."""

from typing import Any
from app.core.context.models import ExecutionContext
from app.core.sdk.ai import AISDK

class TaskGraph:
    """Directed Acyclic Graph of tasks for the Executor."""
    def __init__(self):
        self.tasks = []
        self.dependencies = {}
        
    def add_task(self, task_id: str, capability: str, payload: dict):
        self.tasks.append({"id": task_id, "capability": capability, "payload": payload})
        self.dependencies[task_id] = []
        
    def add_dependency(self, from_task: str, to_task: str):
        self.dependencies[to_task].append(from_task)

class RuleBasedPlanner:
    """Deterministic planning based on predefined rules."""
    async def generate_plan(self, context: ExecutionContext) -> TaskGraph:
        graph = TaskGraph()
        graph.add_task("task_1", "retrieve_policy", {"topic": context.current_task})
        return graph

class LLMAssistedPlanner:
    """Dynamic planning using foundational models via AI SDK."""
    def __init__(self, ai_sdk: AISDK):
        self.ai = ai_sdk
        
    async def generate_plan(self, context: ExecutionContext) -> TaskGraph:
        # Request optimal reasoning model
        client = self.ai.router.get_client("reasoning")
        
        # Simulate LLM generation of a JSON task graph
        # This is where we would normally call client.generate_structured(...)
        graph = TaskGraph()
        graph.add_task("task_1", "search_knowledge", {"query": "how to deploy"})
        graph.add_task("task_2", "validate_policy", {"nodes": ["$task_1.results"]})
        graph.add_dependency("task_1", "task_2")
        return graph

class PlannerRouter:
    """Routes execution context to the optimal planner."""
    def __init__(self):
        self.rule_planner = RuleBasedPlanner()
        self.llm_planner = LLMAssistedPlanner(AISDK())
        
    async def route_and_plan(self, context: ExecutionContext) -> TaskGraph:
        # If simple task, use rules to save cost
        if context.current_task and "policy" in context.current_task.lower():
            return await self.rule_planner.generate_plan(context)
        return await self.llm_planner.generate_plan(context)
