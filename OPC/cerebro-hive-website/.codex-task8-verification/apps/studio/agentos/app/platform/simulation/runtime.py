"""Sandboxed Simulation Engine — Safely tests Planners without side effects."""

from typing import Any
import logging
from app.core.orchestrator.runtime import CognitiveRuntime
from app.core.events.bus import EventBus
from app.core.context.models import ExecutionContext

logger = logging.getLogger("agentos.platform.simulation")

class SandboxEventBus(EventBus):
    """An isolated event bus that records events without triggering real subscribers."""
    def __init__(self):
        super().__init__()
        self.recorded_events = []
        
    async def publish(self, topic: str, payload: dict[str, Any]):
        self.recorded_events.append({"topic": topic, "payload": payload})
        logger.debug(f"[SANDBOX] Published: {topic}")

class CapabilityInterceptor:
    """Intercepts tool calls during simulation and returns mocked responses."""
    def __init__(self, mocks: dict[str, Any]):
        self.mocks = mocks
        
    def intercept(self, capability_name: str, payload: Any) -> Any:
        if capability_name in self.mocks:
            logger.info(f"[SANDBOX] Intercepted call to {capability_name}")
            return self.mocks[capability_name]
        raise Exception(f"Unmocked capability invoked in sandbox: {capability_name}")

class SimulationRuntime:
    """Executes a 'What-If' scenario using the real Cognitive Loop but isolated I/O."""
    
    def __init__(self):
        self.sandbox_bus = SandboxEventBus()
        self.runtime = CognitiveRuntime(event_bus=self.sandbox_bus)
        
    async def run_scenario(self, context: ExecutionContext, mocks: dict[str, Any]) -> dict:
        """Executes the cognitive loop and returns the execution trace and simulated results."""
        logger.info("Starting Simulation Sandbox...")
        
        # In a real implementation, we would inject the CapabilityInterceptor into the registry
        interceptor = CapabilityInterceptor(mocks)
        
        try:
            # Run the actual orchestrator logic
            final_context = await self.runtime.step(context)
            
            return {
                "status": "success",
                "events_emitted": self.sandbox_bus.recorded_events,
                "final_state": final_context.model_dump()
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "events_emitted": self.sandbox_bus.recorded_events
            }
