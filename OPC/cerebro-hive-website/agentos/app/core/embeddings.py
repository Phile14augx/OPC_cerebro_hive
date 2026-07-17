"""Local, dependency-free embeddings so Memory and Knowledge work with zero
external services. This is a deliberately simple hashing bag-of-words vector —
not a real semantic embedding model. Swap for a real embedding API
(Anthropic/OpenAI embeddings, or a local sentence-transformers model) in
production; every call site takes the embedding as a plain float list so the
swap is a one-function change.
"""

import hashlib
import re

import numpy as np

DIM = 256
_TOKEN_RE = re.compile(r"[a-z0-9]+")


def embed(text: str) -> list[float]:
    vec = np.zeros(DIM, dtype=np.float64)
    tokens = _TOKEN_RE.findall(text.lower())
    if not tokens:
        return vec.tolist()

    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        index = int.from_bytes(digest[:4], "big") % DIM
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vec[index] += sign

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    if va.size == 0 or vb.size == 0:
        return 0.0
    denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1e-9
    return float(np.dot(va, vb) / denom)
