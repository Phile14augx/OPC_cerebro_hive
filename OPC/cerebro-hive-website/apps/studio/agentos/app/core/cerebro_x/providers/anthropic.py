import time
from dataclasses import dataclass, field

from app.config import get_settings
from app.core.cerebro_x.base import LLMResponse

settings = get_settings()


@dataclass
class AnthropicProvider:
    name: str = "anthropic"
    api_key: str = field(default_factory=lambda: settings.anthropic_api_key or "")

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        import anthropic

        start = time.perf_counter()
        client = anthropic.Anthropic(api_key=self.api_key)
        resp = client.messages.create(
            model=model or "claude-3-5-sonnet-20240620",
            max_tokens=1024,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = "".join(block.text for block in resp.content if getattr(block, "type", "") == "text")
        usage = resp.usage
        # Approx cost for Sonnet 3.5: $3 / 1M input, $15 / 1M output
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "claude-3-5-sonnet-20240620",
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            latency_ms=latency_ms,
            cost_usd=(usage.input_tokens * 3 + usage.output_tokens * 15) / 1_000_000,
        )

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        import anthropic

        start = time.perf_counter()
        client = anthropic.AsyncAnthropic(api_key=self.api_key)
        resp = await client.messages.create(
            model=model or "claude-3-5-sonnet-20240620",
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
            model=model or "claude-3-5-sonnet-20240620",
            input_tokens=usage.input_tokens,
            output_tokens=usage.output_tokens,
            latency_ms=latency_ms,
            cost_usd=(usage.input_tokens * 3 + usage.output_tokens * 15) / 1_000_000,
        )
