"""Autonomous Executor — Executes TaskGraphs using Capability Registry."""

from typing import Any
from app.core.planning.planner import TaskGraph
from app.core.context.models import ExecutionContext
import asyncio

class Executor:
    """Sequential and parallel executor with dependency resolution."""
    
    def __init__(self):
        # Normally injected from the Capability Registry
        self.capabilities = {}
        
    async def execute_graph(self, context: ExecutionContext, graph: TaskGraph) -> dict[str, Any]:
        """
        Executes a TaskGraph, resolving dependencies dynamically.
        Simulates task execution.
        """
        results = {}
        completed = set()
        in_progress = set()
        
        while len(completed) < len(graph.tasks):
            runnable_tasks = [
                task for task in graph.tasks 
                if task["id"] not in completed and task["id"] not in in_progress
                and all(dep in completed for dep in graph.dependencies.get(task["id"], []))
            ]
            
            if not runnable_tasks and len(in_progress) == 0:
                raise Exception("TaskGraph deadlock detected (circular dependency).")
                
            # Execute runnable tasks in parallel
            for task in runnable_tasks:
                in_progress.add(task["id"])
                
            # Simulate execution of batch
            # In reality, this would await asyncio.gather on capability invocations
            batch_results = await self._execute_batch(runnable_tasks, context)
            
            for task_id, result in batch_results.items():
                results[task_id] = result
                completed.add(task_id)
                in_progress.remove(task_id)
                
        return results

    async def _execute_batch(self, tasks: list[dict], context: ExecutionContext) -> dict[str, Any]:
        """Simulate capability invocation."""
        await asyncio.sleep(0.1) # Simulate IO
        return {task["id"]: {"status": "success", "data": f"Result of {task['capability']}"} for task in tasks}
