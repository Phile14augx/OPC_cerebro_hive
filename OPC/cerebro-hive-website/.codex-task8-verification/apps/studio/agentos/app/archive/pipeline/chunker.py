"""Semantic chunker — splits document text into RAG-ready segments.

Strategies:
  - `fixed`     — fixed token count with overlap (default, fast)
  - `sentence`  — sentence-boundary aware (NLTK optional)
  - `paragraph` — split on double newlines

All strategies respect a maximum chunk size and minimum chunk size
to avoid embedding noise from very short segments.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field


@dataclass
class TextChunk:
    content: str
    chunk_index: int
    token_count: int
    meta: dict = field(default_factory=dict)


def _count_tokens(text: str) -> int:
    """Approximate token count (words × 1.3)."""
    return max(1, int(len(text.split()) * 1.3))


def _split_sentences(text: str) -> list[str]:
    """Split text into sentences using NLTK if available, regex fallback."""
    try:
        import nltk  # type: ignore
        try:
            nltk.data.find("tokenizers/punkt")
        except LookupError:
            nltk.download("punkt", quiet=True)
        return nltk.sent_tokenize(text)
    except ImportError:
        # Regex fallback: split on ". ", "! ", "? " followed by uppercase
        parts = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
        return [p.strip() for p in parts if p.strip()]


def chunk_fixed(
    text: str,
    max_tokens: int = 512,
    overlap_tokens: int = 64,
    min_tokens: int = 30,
) -> list[TextChunk]:
    """Fixed-size chunking with token overlap for context continuity."""
    words = text.split()
    # Approximate words per chunk (1 token ≈ 0.77 words)
    words_per_chunk = int(max_tokens / 1.3)
    overlap_words = int(overlap_tokens / 1.3)

    chunks: list[TextChunk] = []
    start = 0
    idx = 0

    while start < len(words):
        end = min(start + words_per_chunk, len(words))
        chunk_words = words[start:end]
        content = " ".join(chunk_words).strip()
        token_count = _count_tokens(content)

        if token_count >= min_tokens:
            chunks.append(TextChunk(content=content, chunk_index=idx, token_count=token_count))
            idx += 1

        if end >= len(words):
            break
        start = end - overlap_words  # step back by overlap

    return chunks


def chunk_paragraph(text: str, max_tokens: int = 512, min_tokens: int = 30) -> list[TextChunk]:
    """Split on paragraph boundaries; merge short paragraphs."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[TextChunk] = []
    buffer = ""
    idx = 0

    for para in paragraphs:
        candidate = (buffer + "\n\n" + para).strip() if buffer else para
        if _count_tokens(candidate) > max_tokens and buffer:
            if _count_tokens(buffer) >= min_tokens:
                chunks.append(TextChunk(content=buffer, chunk_index=idx, token_count=_count_tokens(buffer)))
                idx += 1
            buffer = para
        else:
            buffer = candidate

    if buffer and _count_tokens(buffer) >= min_tokens:
        chunks.append(TextChunk(content=buffer, chunk_index=idx, token_count=_count_tokens(buffer)))

    return chunks


def chunk_sentence(text: str, max_tokens: int = 512, min_tokens: int = 30) -> list[TextChunk]:
    """Sentence-boundary aware chunking."""
    sentences = _split_sentences(text)
    chunks: list[TextChunk] = []
    buffer = ""
    idx = 0

    for sent in sentences:
        candidate = (buffer + " " + sent).strip() if buffer else sent
        if _count_tokens(candidate) > max_tokens and buffer:
            if _count_tokens(buffer) >= min_tokens:
                chunks.append(TextChunk(content=buffer, chunk_index=idx, token_count=_count_tokens(buffer)))
                idx += 1
            buffer = sent
        else:
            buffer = candidate

    if buffer and _count_tokens(buffer) >= min_tokens:
        chunks.append(TextChunk(content=buffer, chunk_index=idx, token_count=_count_tokens(buffer)))

    return chunks


def chunk(
    text: str,
    strategy: str = "fixed",
    max_tokens: int = 512,
    overlap_tokens: int = 64,
    min_tokens: int = 30,
) -> list[TextChunk]:
    """Main entry point for the ingestion pipeline."""
    if not text or not text.strip():
        return []
    if strategy == "paragraph":
        return chunk_paragraph(text, max_tokens=max_tokens, min_tokens=min_tokens)
    if strategy == "sentence":
        return chunk_sentence(text, max_tokens=max_tokens, min_tokens=min_tokens)
    return chunk_fixed(text, max_tokens=max_tokens, overlap_tokens=overlap_tokens, min_tokens=min_tokens)
