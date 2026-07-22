from typing import Any
from app.core.tools.base import BaseTool, ToolError
from app.core.tools.builtin import FilesystemReadTool, HttpRequestTool, PythonEvalTool, WebSearchTool

class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, BaseTool] = {}
        self.register(FilesystemReadTool())
        self.register(HttpRequestTool())
        self.register(PythonEvalTool())
        self.register(WebSearchTool())

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.metadata.name] = tool

    def get_tool(self, name: str) -> BaseTool | None:
        return self._tools.get(name)

    def invoke(self, tool_name: str, args: dict[str, Any], permissions: list[str] | None = None) -> dict[str, Any]:
        tool = self.get_tool(tool_name)
        if tool is None:
            raise ToolError(f"unknown tool: {tool_name}")

        if permissions is not None:
            for req_perm in tool.permissions_required:
                if req_perm not in permissions:
                    raise ToolError(f"tool '{tool_name}' requires permission '{req_perm}' which is not granted")

        try:
            return tool.execute(args)
        except ToolError:
            raise
        except Exception as exc:
            raise ToolError(f"tool '{tool_name}' failed: {exc}") from exc

registry = ToolRegistry()
