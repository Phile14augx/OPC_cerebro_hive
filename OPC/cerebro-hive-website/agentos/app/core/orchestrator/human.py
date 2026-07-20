"""Human-in-the-Loop Orchestration Hooks."""

from typing import Any
from app.core.events.bus import EventBus
from app.core.context.models import ExecutionContext
import logging

logger = logging.getLogger("agentos.human")

class ApprovalHook:
    """Interceptor that halts execution and emits an approval request."""
    
    def __init__(self, event_bus: EventBus):
        self.bus = event_bus
        
    async def request_approval(self, context: ExecutionContext, reason: str) -> None:
        """
        Emits an approval event and raises an interruption exception.
        This signals to the Cognitive Runtime to stop processing, allowing Temporal 
        to pick up the event and wait for a human decision.
        """
        logger.info(f"Execution halted. Human approval required: {reason}")
        
        await self.bus.publish("human.approval.required", {
            "trace_id": context.trace_id,
            "reason": reason,
            "context_snapshot": context.model_dump()
        })
        
        raise ExecutionInterruptedException("Workflow paused for human approval.")

class ExecutionInterruptedException(Exception):
    """Exception raised when execution is intentionally halted (e.g. for approval)."""
    pass
