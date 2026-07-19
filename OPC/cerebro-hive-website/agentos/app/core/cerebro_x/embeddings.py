import hashlib
import re

import numpy as np

from app.config import get_settings

settings = get_settings()

DIM = 256
_TOKEN_RE = re.compile(r"[a-z0-9]+")


def mock_embed(text: str) -> list[float]:
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


def openai_embed(text: str) -> list[float]:
    import openai
    client = openai.OpenAI(api_key=settings.openai_api_key)
    # text-embedding-3-small outputs 1536 dim by default, but we can constrain it to 256
    resp = client.embeddings.create(
        input=[text],
        model="text-embedding-3-small",
        dimensions=DIM
    )
    return resp.data[0].embedding


def embed(text: str) -> list[float]:
    if settings.openai_api_key:
        try:
            return openai_embed(text)
        except Exception:
            pass # Fall back to mock
    return mock_embed(text)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a), np.array(b)
    if va.size == 0 or vb.size == 0:
        return 0.0
    # Ensure they are the same size. If they aren't, the user swapped models midway.
    if va.shape != vb.shape:
        # Just return 0 to avoid crashing
        return 0.0
    denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1e-9
    return float(np.dot(va, vb) / denom)
