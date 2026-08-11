from typing import Any

from app.config import get_settings
from app.core.cerebro_x.base import LLMResponse, LLMProvider
from app.core.cerebro_x.router import ProviderRouter
from app.core.cerebro_x.providers.anthropic import AnthropicProvider
from app.core.cerebro_x.providers.openai import OpenAIProvider
from app.core.cerebro_x.providers.gemini import GeminiProvider
from app.core.cerebro_x.providers.ollama import OllamaProvider
from app.core.cerebro_x.providers.mock import MockProvider

settings = get_settings()


class CerebroXGateway:
    """The central AI control plane for CerebroHive."""

    def __init__(self):
        chain: list[LLMProvider] = []
        if settings.openai_api_key:
            chain.append(OpenAIProvider())
        if settings.anthropic_api_key:
            chain.append(AnthropicProvider())
        if settings.google_api_key:
            chain.append(GeminiProvider())
        if settings.ollama_base_url:
            chain.append(OllamaProvider())
        
        # Always append mock as the ultimate fallback
        chain.append(MockProvider())
        
        self.router = ProviderRouter(chain)

    def complete(self, system: str, prompt: str, model: str = "", temperature: float = 0.3) -> LLMResponse:
        """Synchronous completion routing through the fallback chain."""
        return self.router.complete(system, prompt, model, temperature)

    async def acomplete(self, system: str, prompt: str, model: str = "", temperature: float = 0.3) -> LLMResponse:
        """Asynchronous completion routing through the fallback chain."""
        return await self.router.acomplete(system, prompt, model, temperature)

gateway = CerebroXGateway()
