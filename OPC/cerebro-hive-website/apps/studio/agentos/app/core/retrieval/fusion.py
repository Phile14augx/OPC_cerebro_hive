"""Pluggable Context Fusion Strategies."""

from typing import Any, List
from abc import ABC, abstractmethod

class FusionStrategy(ABC):
    @abstractmethod
    def fuse(self, results_sets: List[List[dict[str, Any]]]) -> List[dict[str, Any]]:
        pass

class ReciprocalRankFusion(FusionStrategy):
    """Combines multiple ranked lists into a single ranked list using RRF."""
    
    def __init__(self, k: int = 60):
        self.k = k
        
    def fuse(self, results_sets: List[List[dict[str, Any]]]) -> List[dict[str, Any]]:
        scores = {}
        items = {}
        
        for result_set in results_sets:
            for rank, item in enumerate(result_set):
                item_id = item.get("id", str(item))
                if item_id not in scores:
                    scores[item_id] = 0.0
                    items[item_id] = item
                
                # RRF formula: 1 / (k + rank)
                scores[item_id] += 1.0 / (self.k + rank + 1)
                
        # Sort items by accumulated RRF score descending
        fused = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [items[item_id] for item_id, _ in fused]
