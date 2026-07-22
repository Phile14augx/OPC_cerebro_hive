import time
from dataclasses import dataclass, field

from app.config import get_settings
from app.core.cerebro_x.base import LLMResponse

settings = get_settings()


@dataclass
class OpenAIProvider:
    name: str = "openai"
    api_key: str = field(default_factory=lambda: settings.openai_api_key or "")

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        import openai

        start = time.perf_counter()
        client = openai.OpenAI(api_key=self.api_key)
        resp = client.chat.completions.create(
            model=model or "gpt-4o",
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = resp.choices[0].message.content or ""
        usage = resp.usage
        
        input_tokens = usage.prompt_tokens if usage else 1
        output_tokens = usage.completion_tokens if usage else 1
        # Approx cost for GPT-4o: $5 / 1M input, $15 / 1M output
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "gpt-4o",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=(input_tokens * 5 + output_tokens * 15) / 1_000_000,
        )

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        import openai

        start = time.perf_counter()
        client = openai.AsyncOpenAI(api_key=self.api_key)
        resp = await client.chat.completions.create(
            model=model or "gpt-4o",
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = resp.choices[0].message.content or ""
        usage = resp.usage

        input_tokens = usage.prompt_tokens if usage else 1
        output_tokens = usage.completion_tokens if usage else 1
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "gpt-4o",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=(input_tokens * 5 + output_tokens * 15) / 1_000_000,
        )
