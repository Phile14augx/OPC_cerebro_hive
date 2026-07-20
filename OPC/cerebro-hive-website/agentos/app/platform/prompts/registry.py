"""Prompt Registry — Runtime synchronization state from Repository."""

from typing import Dict, Any
from app.platform.prompts.repository import PromptRepository
import logging

logger = logging.getLogger("agentos.platform.prompts")

class PromptRegistry:
    """Stores the latest approved prompts from Git inside the fast PostgreSQL/memory layer."""
    
    def __init__(self, repository: PromptRepository):
        self.repo = repository
        self._prompts: Dict[str, dict] = {}
        
    def sync(self):
        """Sync from repository into the active registry."""
        latest_prompts = self.repo.sync_from_git("https://git.internal/prompts.git")
        for key, prompt_data in latest_prompts.items():
            if prompt_data.get("status") == "approved":
                self._prompts[key] = prompt_data
                logger.info(f"Loaded approved prompt {key} v{prompt_data.get('version')}")
                
    def get_template(self, prompt_id: str) -> str:
        if prompt_id not in self._prompts:
            raise KeyError(f"Prompt {prompt_id} not found in active registry.")
        return self._prompts[prompt_id]["template"]
