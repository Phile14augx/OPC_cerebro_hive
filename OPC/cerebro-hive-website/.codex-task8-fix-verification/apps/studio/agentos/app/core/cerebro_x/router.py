from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.cerebro_x.base import LLMProvider, LLMResponse


class ProviderRouter:
    """Routes requests through a fallback chain of providers."""
    
    def __init__(self, chain: list[LLMProvider]):
        self.chain = chain

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        last_error: Exception | None = None
        for provider in self.chain:
            try:
                return provider.complete(system, prompt, model, temperature)
            except Exception as exc:
                last_error = exc
                continue
        raise RuntimeError(f"All providers in the routing chain failed. Last error: {last_error}")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        last_error: Exception | None = None
        for provider in self.chain:
            try:
                return await provider.acomplete(system, prompt, model, temperature)
            except Exception as exc:
                last_error = exc
                continue
        raise RuntimeError(f"All providers in the routing chain failed. Last error: {last_error}")
