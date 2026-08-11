"""Prompt Compiler & Renderer — Processes dynamic variables into final LLM inputs."""

from typing import Dict, Any

class PromptCompiler:
    """Compiles raw prompt templates by checking syntax and variable bindings."""
    
    def compile(self, template: str, required_vars: list[str]) -> bool:
        """Verify that a template string safely accepts all required variables."""
        for var in required_vars:
            if f"{{{var}}}" not in template:
                return False
        return True

class PromptRenderer:
    """Renders the compiled prompt using the live execution context."""
    
    def render(self, template: str, variables: Dict[str, Any]) -> str:
        """Safely format the template with runtime variables."""
        try:
            return template.format(**variables)
        except KeyError as e:
            raise ValueError(f"Missing variable required by prompt template: {e}")
