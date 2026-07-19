from dataclasses import dataclass
from typing import Any, Protocol

class ToolError(Exception):
    pass


@dataclass
class ToolMetadata:
    name: str
    description: str
    version: str = "1.0.0"


class BaseTool(Protocol):
    metadata: ToolMetadata
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    permissions_required: list[str]

    def execute(self, args: dict[str, Any]) -> dict[str, Any]:
        """Execute the tool synchronously."""
        ...

def to_json_safe(payload: dict[str, Any]) -> str:
    import json
    try:
        return json.dumps(payload)[:2000]
    except TypeError:
        return str(payload)[:2000]

