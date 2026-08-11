"""Hybrid Hierarchical Actor Model — Multi-Agent Coordination via Event Bus."""

from typing import Any
from app.core.events.bus import EventBus
from app.core.context.models import ExecutionContext
import logging

logger = logging.getLogger("agentos.multiagent")

class WorkerAgent:
    """Independent worker agent that listens to specific capability events."""
    
    def __init__(self, agent_id: str, capability_domain: str, event_bus: EventBus):
        self.agent_id = agent_id
        self.domain = capability_domain
        self.bus = event_bus
        
    async def start(self):
        """Subscribe to relevant domain events."""
        await self.bus.subscribe(f"{self.domain}.task.assigned", self.handle_task)
        
    async def handle_task(self, event: dict[str, Any]):
        """Execute the assigned task independently."""
        logger.info(f"Worker {self.agent_id} handling task in {self.domain}")
        # Simulate work
        result = {"status": "success", "worker": self.agent_id, "data": "task_result"}
        
        # Publish result back to the bus
        await self.bus.publish(f"{self.domain}.task.completed", {
            "trace_id": event.get("trace_id"),
            "result": result
        })

class ManagerAgent:
    """Manager agent that decomposes goals, allocates budgets, and delegates to workers."""
    
    def __init__(self, event_bus: EventBus):
        self.bus = event_bus
        self.active_tasks = {}
        
    async def orchestrate(self, context: ExecutionContext):
        """Decompose objectives and delegate to workers via the Event Bus."""
        logger.info("Manager Agent decomposing goal into tasks...")
        
        # 1. Define objectives and budgets
        task_1 = {"id": "t1", "domain": "planning", "budget": 100}
        task_2 = {"id": "t2", "domain": "validation", "budget": 50}
        
        self.active_tasks[context.trace_id] = [task_1["id"], task_2["id"]]
        
        # 2. Delegate to workers asynchronously
        await self.bus.publish("planning.task.assigned", {"trace_id": context.trace_id, "task": task_1})
        await self.bus.publish("validation.task.assigned", {"trace_id": context.trace_id, "task": task_2})
        
        # 3. Wait for results (simulated via subscription in real app)
        logger.info("Manager Agent waiting for worker results via Event Bus...")
