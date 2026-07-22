"""AI SDK Base — Abstract LLM Client Interface."""

from typing import Any, AsyncGenerator
from abc import ABC, abstractmethod

class LLMClient(ABC):
    """Provider-agnostic interface for Foundation Models."""
    
    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> str:
        """Standard text completion."""
        pass
        
    @abstractmethod
    async def complete_stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        """Streaming text completion."""
        pass
        
    @abstractmethod
    async def generate_structured(self, prompt: str, schema: type, **kwargs) -> Any:
        """Generate structured JSON output adhering to a Pydantic schema."""
        pass
        
    @abstractmethod
    async def execute_tools(self, prompt: str, tools: list[dict[str, Any]], **kwargs) -> Any:
        """Perform tool calling / function calling."""
        pass
        
    @abstractmethod
    def get_token_count(self, text: str) -> int:
        """Calculate token cost for the specific provider's tokenizer."""
        pass
