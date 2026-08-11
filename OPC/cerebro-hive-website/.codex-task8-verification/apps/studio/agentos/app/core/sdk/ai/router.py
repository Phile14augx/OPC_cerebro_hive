"""AI SDK — Model Router."""

from typing import Any
from .base import LLMClient
from .providers.openai import OpenAIClient
from .providers.anthropic import AnthropicClient
from .providers.vllm import VLLMClient

class LLMRouter:
    """Routes requests to the optimal LLM provider based on capability, cost, and latency."""
    
    def __init__(self):
        self.providers = {
            "openai": OpenAIClient(),
            "anthropic": AnthropicClient(),
            "vllm": VLLMClient()
        }
        
    def get_client(self, model_class: str = "reasoning") -> LLMClient:
        """Get the best client for the requested class of model."""
        if model_class == "reasoning":
            return self.providers["openai"] # e.g. GPT-4o
        elif model_class == "fast":
            return self.providers["vllm"] # e.g. Llama-3-8B locally
        else:
            return self.providers["anthropic"]
