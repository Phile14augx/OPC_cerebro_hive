import time
from dataclasses import dataclass, field
import httpx

from app.config import get_settings
from app.core.cerebro_x.base import LLMResponse

settings = get_settings()


@dataclass
class OllamaProvider:
    name: str = "ollama"
    base_url: str = field(default_factory=lambda: settings.ollama_base_url.rstrip("/"))

    def complete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        start = time.perf_counter()
        
        # We use standard requests/httpx here since ollama SDK isn't strictly necessary for the REST API
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model or "llama3",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": temperature
                    }
                }
            )
            resp.raise_for_status()
            data = resp.json()
        
        latency_ms = (time.perf_counter() - start) * 1000
        text = data.get("message", {}).get("content", "")
        
        input_tokens = data.get("prompt_eval_count", 1)
        output_tokens = data.get("eval_count", 1)
        
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "llama3",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=0.0,
        )

    async def acomplete(self, system: str, prompt: str, model: str, temperature: float) -> LLMResponse:
        start = time.perf_counter()
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": model or "llama3",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False,
                    "options": {
                        "temperature": temperature
                    }
                }
            )
            resp.raise_for_status()
            data = resp.json()
        
        latency_ms = (time.perf_counter() - start) * 1000
        text = data.get("message", {}).get("content", "")
        
        input_tokens = data.get("prompt_eval_count", 1)
        output_tokens = data.get("eval_count", 1)
        
        return LLMResponse(
            text=text,
            provider=self.name,
            model=model or "llama3",
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
            cost_usd=0.0,
        )
