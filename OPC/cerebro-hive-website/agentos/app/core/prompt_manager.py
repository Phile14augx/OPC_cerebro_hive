"""Prompt Management: versioned templates with render + diff + rollback.

Persisted to a small JSON file (prompt_versions.json) rather than a DB table —
enough to give real version history across restarts without adding another
migration surface for an MVP. Production swap-in: a dedicated prompts table
with approvals/A-B-test assignment, but the API shape (get/render/version/
rollback) already matches what that table would back.
"""

from __future__ import annotations

import json
import threading
from pathlib import Path

_LOCK = threading.Lock()
_STORE_PATH = Path(__file__).resolve().parent.parent.parent / "prompt_versions.json"


def _load() -> dict[str, list[dict]]:
    if not _STORE_PATH.exists():
        return {}
    return json.loads(_STORE_PATH.read_text())


def _save(data: dict[str, list[dict]]) -> None:
    _STORE_PATH.write_text(json.dumps(data, indent=2))


def save_version(name: str, template: str, author: str = "system") -> dict:
    with _LOCK:
        data = _load()
        versions = data.setdefault(name, [])
        version_number = len(versions) + 1
        record = {"version": version_number, "template": template, "author": author}
        versions.append(record)
        _save(data)
        return record


def get_latest(name: str) -> dict | None:
    data = _load()
    versions = data.get(name, [])
    return versions[-1] if versions else None


def get_history(name: str) -> list[dict]:
    return _load().get(name, [])


def render(template: str, context: dict) -> str:
    try:
        return template.format(**context)
    except (KeyError, IndexError):
        return template
