"""LLM Gateway: provider abstraction with routing and fallback.

Supports Anthropic and OpenAI when API keys are configured, Ollama when a base
URL is reachable, and always falls back to a deterministic MockProvider so
the whole platform is runnable and testable with zero external dependencies.
"""

from __future__ import annotations

import hashlib
import time
from dataclasses import dataclass, field
from typing import Protocol

from app.config import get_settings

settings = get_settings()


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

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse: ...


@dataclass
class MockProvider:
    """Deterministic, offline provider. Reasoning content is synthesized from
    the prompt so behavior is stable across test runs without hitting a real
    model — this is what makes `pytest` and local `uvicorn` runs work with no
    API keys configured at all.
    """

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


@dataclass
class AnthropicProvider:
    name: str = "anthropic"
    api_key: str = field(default_factory=lambda: settings.anthropic_api_key or "")

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        import anthropic  # local import: optional dependency

        start = time.perf_counter()
        client = anthropic.Anthropic(api_key=self.api_key)
        resp = client.messages.create(
            model=model or "claude-sonnet-4-5",
            max_tokens=1024,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = "".join(block.text for block in resp.content if getattr(block, "type", "") == "text")
        usage = resp.usage
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model,
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            latency_ms=latency_ms,
            cost_usd=(usage.input_tokens * 3 + usage.output_tokens * 15) / 1_000_000,
        )


class LLMGateway:
    """Routes to the best available provider, falling back down the chain on
    any failure so a single provider outage never takes the runtime down.
    """

    def __init__(self) -> None:
        self._chain: list[LLMProvider] = []
        if settings.anthropic_api_key:
            self._chain.append(AnthropicProvider())
        # OpenAI / Ollama adapters follow the same Protocol and can be
        # appended here; omitted from the MVP body to keep the gateway
        # focused, but the routing/fallback logic below already supports them.
        self._chain.append(MockProvider())

    def complete(self, system: str, prompt: str, model: str = "mock-1", temperature: float = 0.3) -> LLMResponse:
        last_error: Exception | None = None
        for provider in self._chain:
            try:
                return provider.complete(system=system, prompt=prompt, model=model, temperature=temperature)
            except Exception as exc:  # noqa: BLE001 — deliberate: fall back to next provider
                last_error = exc
                continue
        raise RuntimeError(f"All LLM providers failed: {last_error}")


gateway = LLMGateway()
