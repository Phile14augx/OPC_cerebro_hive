"""Memory Consolidation Engine — Explicit memory promotion policies."""

from typing import Any
from app.core.context.models import ExecutionContext
import logging

logger = logging.getLogger("agentos.memory.consolidation")

class MemoryConsolidator:
    """Capability that promotes working memory to semantic or episodic storage."""
    
    def consolidate(self, context: ExecutionContext, reflection: dict[str, Any]) -> None:
        """
        Evaluate working memory facts and promote based on importance, novelty, and retention policies.
        """
        for key, memory_item in context.working_memory.items():
            importance = self._score_importance(memory_item, reflection)
            novelty = self._score_novelty(memory_item)
            
            # Retention Policy: Only promote if novel and important
            if importance > 0.7 and novelty > 0.5:
                # Decide destination tier based on memory type
                if memory_item.get("type") == "fact":
                    self._promote_to_semantic(key, memory_item)
                else:
                    self._promote_to_episodic(key, memory_item)
            else:
                self._discard(key)
                
    def _score_importance(self, item: dict, reflection: dict) -> float:
        # Heavily weigh facts that led to high reasoning_quality
        return 0.8 if reflection.get("reasoning_quality", 0) > 0.8 else 0.4
        
    def _score_novelty(self, item: dict) -> float:
        return 0.9 # Assume novel for now
        
    def _promote_to_semantic(self, key: str, item: dict):
        logger.info(f"Promoting {key} to Semantic Memory (Knowledge Graph)")
        
    def _promote_to_episodic(self, key: str, item: dict):
        logger.info(f"Promoting {key} to Episodic Memory (Lineage)")
        
    def _discard(self, key: str):
        logger.debug(f"Discarding working memory: {key}")
