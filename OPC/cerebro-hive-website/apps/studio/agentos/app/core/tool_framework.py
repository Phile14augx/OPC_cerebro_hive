"""Tool Framework: a universal tool abstraction with schema + permissions.

Built-in tools are real (they actually run), scoped deliberately conservatively
(read-only filesystem access rooted at this project, outbound HTTP via
httpx, a restricted python_eval, and a stubbed web_search) since this runs in
shared sandboxes. Registering an MCP server or a REST/GraphQL API as a tool is
a matter of adding a ToolDefinition row with kind="mcp"/"rest"/"graphql" —
the runtime already treats every tool as "look up permissions, then invoke".
"""

from __future__ import annotations

import io
import json
from contextlib import redirect_stdout
from pathlib import Path
from typing import Any, Callable

import httpx

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class ToolError(Exception):
    pass


def _tool_filesystem_read(args: dict[str, Any]) -> dict[str, Any]:
    rel_path = args.get("path", "")
    target = (PROJECT_ROOT / rel_path).resolve()
    if PROJECT_ROOT not in target.parents and target != PROJECT_ROOT:
        raise ToolError("path escapes the project root")
    if not target.exists():
        raise ToolError(f"{rel_path} does not exist")
    return {"content": target.read_text(errors="replace")[:5000]}


def _tool_http_request(args: dict[str, Any]) -> dict[str, Any]:
    url = args["url"]
    method = args.get("method", "GET").upper()
    with httpx.Client(timeout=10) as client:
        resp = client.request(method, url, json=args.get("json"))
    return {"status_code": resp.status_code, "body": resp.text[:5000]}


def _tool_python_eval(args: dict[str, Any]) -> dict[str, Any]:
    """A restricted expression/statement evaluator — no imports, no
    filesystem/network builtins. Enough for math/data-shaping steps in a
    plan; not a general-purpose sandboxed interpreter.
    """
    code = args.get("code", "")
    forbidden = ("import", "__", "open(", "exec(", "eval(", "os.", "sys.")
    if any(token in code for token in forbidden):
        raise ToolError("code contains a disallowed construct")

    safe_builtins = {
        "len": len,
        "sum": sum,
        "min": min,
        "max": max,
        "range": range,
        "round": round,
        "print": print,
        "abs": abs,
        "sorted": sorted,
        "enumerate": enumerate,
        "str": str,
        "int": int,
        "float": float,
        "list": list,
        "dict": dict,
    }
    buffer = io.StringIO()
    local_vars: dict[str, Any] = {}
    with redirect_stdout(buffer):
        exec(code, {"__builtins__": safe_builtins}, local_vars)  # noqa: S102 — deliberately restricted
    return {"stdout": buffer.getvalue(), "locals": {k: v for k, v in local_vars.items() if not k.startswith("_")}}


def _tool_web_search(args: dict[str, Any]) -> dict[str, Any]:
    """Stub: no outbound search provider is wired up in the MVP. Swap in a
    real search API (Brave/Bing/Google/Tavily) behind this same signature.
    """
    return {"results": [], "note": f"web_search is a stub in this MVP; query was: {args.get('query', '')}"}


BUILTIN_TOOLS: dict[str, Callable[[dict[str, Any]], dict[str, Any]]] = {
    "filesystem_read": _tool_filesystem_read,
    "http_request": _tool_http_request,
    "python_eval": _tool_python_eval,
    "web_search": _tool_web_search,
}

BUILTIN_TOOL_SCHEMAS: dict[str, dict[str, Any]] = {
    "filesystem_read": {"path": "string (relative to project root)"},
    "http_request": {"url": "string", "method": "string (default GET)", "json": "object (optional)"},
    "python_eval": {"code": "string (restricted Python)"},
    "web_search": {"query": "string"},
}


def invoke(tool_name: str, args: dict[str, Any], permissions: list[str] | None = None) -> dict[str, Any]:
    fn = BUILTIN_TOOLS.get(tool_name)
    if fn is None:
        raise ToolError(f"unknown tool: {tool_name}")

    if permissions is not None and "execute" not in permissions:
        raise ToolError(f"tool '{tool_name}' is not permitted to execute for this agent")

    try:
        return fn(args)
    except ToolError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ToolError(f"tool '{tool_name}' failed: {exc}") from exc


def to_json_safe(payload: dict[str, Any]) -> str:
    try:
        return json.dumps(payload)[:2000]
    except TypeError:
        return str(payload)[:2000]
