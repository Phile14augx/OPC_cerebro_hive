import hashlib
import time
from dataclasses import dataclass

from app.core.cerebro_x.base import LLMProvider, LLMResponse


@dataclass
class MockProvider:
    name: str = "mock"

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        start = time.perf_counter()
        digest = hashlib.sha1(prompt.encode()).hexdigest()[:8]
        text = (
            f"[mock:{model}] Based on the goal, here is a synthesized response "
            f"(trace {digest}): {prompt.strip()[:280]}"
        )
        latency_ms = (time.perf_counter() - start) * 1000
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model,
            input_tokens=max(1, len(prompt.split())),
            output_tokens=max(1, len(text.split())),
            latency_ms=latency_ms,
            cost_usd=0.0,
        )

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        return self.complete(system, prompt, model, temperature)
