import io
from contextlib import redirect_stdout
from pathlib import Path
from typing import Any

import httpx

from app.core.tools.base import BaseTool, ToolError, ToolMetadata

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class FilesystemReadTool(BaseTool):
    metadata = ToolMetadata("filesystem_read", "Read a file from the project directory.")
    input_schema = {"path": "string (relative to project root)"}
    output_schema = {"content": "string"}
    permissions_required = ["execute"]

    def execute(self, args: dict[str, Any]) -> dict[str, Any]:
        rel_path = args.get("path", "")
        target = (PROJECT_ROOT / rel_path).resolve()
        if PROJECT_ROOT not in target.parents and target != PROJECT_ROOT:
            raise ToolError("path escapes the project root")
        if not target.exists():
            raise ToolError(f"{rel_path} does not exist")
        return {"content": target.read_text(errors="replace")[:5000]}


class HttpRequestTool(BaseTool):
    metadata = ToolMetadata("http_request", "Make an HTTP request.")
    input_schema = {"url": "string", "method": "string (default GET)", "json": "object (optional)"}
    output_schema = {"status_code": "integer", "body": "string"}
    permissions_required = ["execute"]

    def execute(self, args: dict[str, Any]) -> dict[str, Any]:
        url = args["url"]
        method = args.get("method", "GET").upper()
        with httpx.Client(timeout=10) as client:
            resp = client.request(method, url, json=args.get("json"))
        return {"status_code": resp.status_code, "body": resp.text[:5000]}


class PythonEvalTool(BaseTool):
    metadata = ToolMetadata("python_eval", "Evaluate a restricted Python expression.")
    input_schema = {"code": "string (restricted Python)"}
    output_schema = {"stdout": "string", "locals": "object"}
    permissions_required = ["execute"]

    def execute(self, args: dict[str, Any]) -> dict[str, Any]:
        code = args.get("code", "")
        forbidden = ("import", "__", "open(", "exec(", "eval(", "os.", "sys.")
        if any(token in code for token in forbidden):
            raise ToolError("code contains a disallowed construct")

        safe_builtins = {
            "len": len, "sum": sum, "min": min, "max": max, "range": range,
            "round": round, "print": print, "abs": abs, "sorted": sorted,
            "enumerate": enumerate, "str": str, "int": int, "float": float,
            "list": list, "dict": dict,
        }
        buffer = io.StringIO()
        local_vars: dict[str, Any] = {}
        with redirect_stdout(buffer):
            exec(code, {"__builtins__": safe_builtins}, local_vars)  # noqa: S102
        return {"stdout": buffer.getvalue(), "locals": {k: v for k, v in local_vars.items() if not k.startswith("_")}}


class WebSearchTool(BaseTool):
    metadata = ToolMetadata("web_search", "Search the web.")
    input_schema = {"query": "string"}
    output_schema = {"results": "array", "note": "string"}
    permissions_required = ["execute"]

    def execute(self, args: dict[str, Any]) -> dict[str, Any]:
        return {"results": [], "note": f"web_search is a stub in this MVP; query was: {args.get('query', '')}"}
