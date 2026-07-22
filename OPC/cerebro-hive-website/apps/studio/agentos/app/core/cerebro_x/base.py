from dataclasses import dataclass
from typing import Protocol


@dataclass
class LLMResponse:
    text: str
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    cost_usd: float = 0.0


class LLMProvider(Protocol):
    name: str

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        ...

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        ...
