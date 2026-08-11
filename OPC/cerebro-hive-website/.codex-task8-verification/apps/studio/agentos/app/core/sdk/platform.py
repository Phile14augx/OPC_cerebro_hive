"""Platform SDK — The single entry point for all internal SDKs (Service Discovery)."""

from app.core.sdk.identity import IdentitySDK
from app.core.sdk.storage import StorageSDK
from app.core.sdk.events import EventsSDK
from app.core.sdk.search import SearchSDK
from app.core.sdk.workflow import WorkflowSDK
from app.core.sdk.observability import ObservabilitySDK
from app.core.sdk.configuration import ConfigurationSDK
from app.core.sdk.ai import AISDK
from app.core.sdk.agent import AgentSDK

class PlatformSDK:
    """Service discovery interface to avoid coupling modules directly to implementations."""
    
    def __init__(self):
        self.identity = IdentitySDK()
        self.storage = StorageSDK()
        self.events = EventsSDK()
        self.search = SearchSDK()
        self.workflow = WorkflowSDK()
        self.observability = ObservabilitySDK()
        self.config = ConfigurationSDK()
        self.ai = AISDK()
        self.agent = AgentSDK()

# Global singleton
platform = PlatformSDK()
