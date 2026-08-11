"""Document parser — extracts plain text from various file types.

Supported:
  .md / .txt    — read directly
  .pdf          — pdfplumber (optional)
  .docx         — python-docx (optional)
  .html / .htm  — BeautifulSoup4 (optional)
  URL           — httpx fetch + HTML strip

All optional dependencies gracefully degrade: if a library is missing,
the parser returns an error message instead of raising, so the ingestion
pipeline can mark the document as `partially_parsed` rather than crash.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger("agentos.archive.parser")


@dataclass
class ParseResult:
    text: str
    file_type: str
    success: bool
    error: str | None = None
    metadata: dict | None = None


def _strip_html(html: str) -> str:
    """Remove HTML tags and collapse whitespace."""
    try:
        from bs4 import BeautifulSoup  # type: ignore
        soup = BeautifulSoup(html, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()
        text = soup.get_text(separator="\n")
    except ImportError:
        # Fallback: regex strip
        text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def parse_text(content: str) -> ParseResult:
    return ParseResult(text=content.strip(), file_type="text", success=True)


def parse_markdown(content: str) -> ParseResult:
    # Strip markdown syntax for embedding purposes; keep structure
    text = re.sub(r"```[\s\S]*?```", "", content)   # remove code blocks
    text = re.sub(r"`[^`]+`", "", text)              # remove inline code
    text = re.sub(r"#+\s*", "", text)                # remove headings markup
    text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)  # links → text
    return ParseResult(text=text.strip(), file_type="markdown", success=True)


def parse_html(content: str) -> ParseResult:
    text = _strip_html(content)
    return ParseResult(text=text, file_type="html", success=True)


def parse_pdf(data: bytes) -> ParseResult:
    try:
        import pdfplumber  # type: ignore
        import io
        pages = []
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages:
                pages.append(page.extract_text() or "")
        text = "\n\n".join(p for p in pages if p.strip())
        return ParseResult(text=text, file_type="pdf", success=True, metadata={"page_count": len(pages)})
    except ImportError:
        return ParseResult(text="", file_type="pdf", success=False, error="pdfplumber not installed (pip install pdfplumber)")
    except Exception as exc:
        return ParseResult(text="", file_type="pdf", success=False, error=str(exc))


def parse_docx(data: bytes) -> ParseResult:
    try:
        import docx  # type: ignore
        import io
        doc = docx.Document(io.BytesIO(data))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return ParseResult(text="\n\n".join(paragraphs), file_type="docx", success=True)
    except ImportError:
        return ParseResult(text="", file_type="docx", success=False, error="python-docx not installed (pip install python-docx)")
    except Exception as exc:
        return ParseResult(text="", file_type="docx", success=False, error=str(exc))


def parse_url(url: str) -> ParseResult:
    try:
        import httpx
        resp = httpx.get(url, timeout=10, follow_redirects=True, headers={"User-Agent": "CerebroArchive/1.0"})
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "html" in content_type:
            text = _strip_html(resp.text)
        else:
            text = resp.text
        return ParseResult(text=text, file_type="url", success=True, metadata={"url": url, "status_code": resp.status_code})
    except Exception as exc:
        return ParseResult(text="", file_type="url", success=False, error=str(exc))


def parse(
    content: str | bytes | None = None,
    file_type: str = "text",
    source_url: str | None = None,
) -> ParseResult:
    """Main dispatch function. Call this from the ingestion pipeline."""
    if source_url and not content:
        return parse_url(source_url)

    if content is None:
        return ParseResult(text="", file_type=file_type, success=False, error="No content provided")

    ft = file_type.lower().lstrip(".")
    if ft in ("md", "markdown"):
        return parse_markdown(content if isinstance(content, str) else content.decode("utf-8", errors="replace"))
    if ft in ("html", "htm"):
        return parse_html(content if isinstance(content, str) else content.decode("utf-8", errors="replace"))
    if ft == "pdf":
        return parse_pdf(content if isinstance(content, bytes) else content.encode())
    if ft == "docx":
        return parse_docx(content if isinstance(content, bytes) else content.encode())
    # txt, json, csv, etc.
    text = content if isinstance(content, str) else content.decode("utf-8", errors="replace")
    return parse_text(text)
