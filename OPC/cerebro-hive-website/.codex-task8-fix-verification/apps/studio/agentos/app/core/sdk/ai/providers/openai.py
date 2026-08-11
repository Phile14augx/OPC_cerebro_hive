from typing import Any, AsyncGenerator
from app.core.sdk.ai.base import LLMClient

class OpenAIClient(LLMClient):
    async def complete(self, prompt: str, **kwargs) -> str:
        return "Mocked OpenAI response"
        
    async def complete_stream(self, prompt: str, **kwargs) -> AsyncGenerator[str, None]:
        yield "Mocked OpenAI stream"
        
    async def generate_structured(self, prompt: str, schema: type, **kwargs) -> Any:
        return {}
        
    async def execute_tools(self, prompt: str, tools: list[dict[str, Any]], **kwargs) -> Any:
        return {}
        
    def get_token_count(self, text: str) -> int:
        return len(text.split())
