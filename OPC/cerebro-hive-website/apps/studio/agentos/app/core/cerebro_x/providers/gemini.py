import time
from dataclasses import dataclass, field

from app.config import get_settings
from app.core.cerebro_x.base import LLMResponse

settings = get_settings()


@dataclass
class GeminiProvider:
    name: str = "gemini"
    api_key: str = field(default_factory=lambda: settings.google_api_key or "")

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        from google import genai

        start = time.perf_counter()
        client = genai.Client(api_key=self.api_key)
        
        # Gemini expects system instructions in the config
        resp = client.models.generate_content(
            model=model or "gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": system,
                "temperature": temperature,
            }
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = resp.text or ""
        
        usage = resp.usage_metadata
        input_tokens = usage.prompt_token_count if usage else 1
        output_tokens = usage.candidates_token_count if usage else 1
        
        # Approx cost for Gemini Flash: $0.075 / 1M input, $0.30 / 1M output
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "gemini-2.5-flash",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=(input_tokens * 0.075 + output_tokens * 0.3) / 1_000_000,
        )

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        from google import genai

        start = time.perf_counter()
        client = genai.Client(api_key=self.api_key)
        
        resp = await client.aio.models.generate_content(
            model=model or "gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": system,
                "temperature": temperature,
            }
        )
        latency_ms = (time.perf_counter() - start) * 1000
        text = resp.text or ""
        
        usage = resp.usage_metadata
        input_tokens = usage.prompt_token_count if usage else 1
        output_tokens = usage.candidates_token_count if usage else 1

        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "gemini-2.5-flash",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=(input_tokens * 0.075 + output_tokens * 0.3) / 1_000_000,
        )
