"""Orchestration Layer — Lightweight, stateless, event-driven Cognitive Loop."""

from typing import Any
from app.core.context.models import ExecutionContext
from app.core.events.bus import EventBus
import logging

logger = logging.getLogger("agentos.runtime")

class PolicyEnforcementPoint:
    """Evaluates ExecutionContext against active enterprise policies."""
    
    def evaluate(self, context: ExecutionContext, capability: str) -> bool:
        """Returns True if the capability is permitted to run given the current context."""
        # E.g., check token budget, latency budget, or IAM permissions
        if "sensitive_data" in context.current_task and capability == "public_search":
            logger.warning("Policy violation: public search denied on sensitive data.")
            return False
        return True

class CognitiveRuntime:
    """Fast, in-memory AI runtime managing the Cognitive Loop."""
    
    def __init__(self, event_bus: EventBus):
        self.bus = event_bus
        self.pep = PolicyEnforcementPoint()
        
    async def step(self, context: ExecutionContext) -> ExecutionContext:
        """
        Execute one full cycle of the Cognitive Loop.
        Observe -> Retrieve -> Infer -> Validate -> Memory -> Plan -> Execute -> Evaluate
        """
        await self.bus.publish("cognitive.observe.started", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.retrieve.started", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.infer.started", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.validate.started", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.memory.updated", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.plan.started", {"trace_id": context.trace_id})
        
        # Policy Enforcement before execution
        if not self.pep.evaluate(context, "TaskGraphExecutor"):
            await self.bus.publish("policy.violation", {"trace_id": context.trace_id, "reason": "Budget Exceeded"})
            raise Exception("Policy Violation during execution setup.")
            
        await self.bus.publish("cognitive.execute.started", {"trace_id": context.trace_id})
        await self.bus.publish("cognitive.evaluate.started", {"trace_id": context.trace_id})
        
        return context
