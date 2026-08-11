"""Archive Embedder — wraps Cerebro X embeddings for the ingestion pipeline.

Routes through the same `app.core.cerebro_x.embeddings` primitive used by
the agent runtime (memory engine, agent_vote consensus) so the entire
platform shares one embedding stack. Falls back to deterministic mock
embedding when no API key is configured.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

logger = logging.getLogger("agentos.archive.embedder")

EMBEDDING_DIM = 256  # must match core/cerebro_x/embeddings.py DIM


@dataclass
class EmbeddingResult:
    vector: list[float]
    model: str
    dim: int
    cached: bool = False


def embed_text(text: str) -> EmbeddingResult:
    """Embed a single text string using Cerebro X."""
    from app.core.cerebro_x.embeddings import embed
    try:
        vector = embed(text)
        model = "openai/text-embedding-3-small" if len(vector) > 100 else "mock/sha256-hash"
        return EmbeddingResult(vector=vector, model=model, dim=len(vector))
    except Exception as exc:
        logger.warning("Embedding failed, using zero vector: %s", exc)
        return EmbeddingResult(vector=[0.0] * EMBEDDING_DIM, model="fallback/zeros", dim=EMBEDDING_DIM)


def embed_batch(texts: list[str], batch_size: int = 32) -> list[EmbeddingResult]:
    """Embed a list of texts in batches."""
    results: list[EmbeddingResult] = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        for text in batch:
            results.append(embed_text(text))
    return results
