"""Capability Registry — IoC Container with Metadata and Health Monitoring."""

from typing import Any, Dict, Optional
import time

class CapabilityMetadata:
    def __init__(self, name: str, version: str = "v1", owner: str = "system"):
        self.name = name
        self.version = version
        self.status = "active"
        self.health = "healthy"
        self.latency_ms = 0.0
        self.cost_per_invoke = 0.0
        self.owner = owner
        self.dependencies = []
        self.last_invoked = 0.0

class CapabilityRegistry:
    """Central registry mapping interfaces to concrete implementations."""
    
    def __init__(self):
        self._capabilities: Dict[str, Any] = {}
        self._metadata: Dict[str, CapabilityMetadata] = {}
        
    def register(self, name: str, instance: Any, metadata: Optional[CapabilityMetadata] = None):
        """Register a capability implementation."""
        self._capabilities[name] = instance
        self._metadata[name] = metadata or CapabilityMetadata(name=name)
        
    def get(self, name: str) -> Any:
        """Resolve a capability, updating latency/invocation metadata."""
        if name not in self._capabilities:
            raise KeyError(f"Capability '{name}' not found in registry.")
            
        meta = self._metadata[name]
        if meta.health != "healthy" and meta.status != "experimental":
            raise Exception(f"Cannot dispatch to unhealthy capability: {name}")
            
        meta.last_invoked = time.time()
        return self._capabilities[name]
        
    def health_check(self) -> dict[str, Any]:
        """Perform simulated health checks on all registered capabilities."""
        report = {}
        for name, meta in self._metadata.items():
            # Simulate a health check
            is_healthy = True # Simulated
            meta.health = "healthy" if is_healthy else "degraded"
            
            report[name] = {
                "version": meta.version,
                "status": meta.status,
                "health": meta.health,
                "avg_latency_ms": meta.latency_ms
            }
        return report
