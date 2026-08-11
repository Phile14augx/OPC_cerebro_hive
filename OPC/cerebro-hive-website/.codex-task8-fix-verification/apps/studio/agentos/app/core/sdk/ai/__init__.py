"""AI SDK — Foundation Model, Tool Calling, and Agent Execution integrations."""

from .router import LLMRouter

class AISDK:
    def __init__(self):
        self.router = LLMRouter()
