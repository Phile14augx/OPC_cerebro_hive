import { render } from "@testing-library/react";
import { Position } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { SemanticEdge } from "./SemanticEdge";

describe("SemanticEdge", () => {
  it("exposes relationship semantics on the rendered SVG edge", () => {
    const { container } = render(
      <svg>
        <SemanticEdge
          id="edge-builder-docs"
          source="agent-builder"
          target="resource-docs"
          sourceX={0}
          sourceY={0}
          sourcePosition={Position.Bottom}
          targetX={100}
          targetY={100}
          targetPosition={Position.Top}
          selected
          data={{ relationship: "READS_FROM", status: "degraded", intensity: 0.8, lastActivityAt: null, highlighted: true }}
        />
      </svg>,
    );

    expect(container.querySelector("path")).toHaveAttribute("data-relationship", "READS_FROM");
    expect(container.querySelector("path")).toHaveAttribute("data-status", "degraded");
    expect(container.querySelector("path")).toHaveAttribute("data-selected", "true");
    expect(container.querySelector("path")).toHaveAttribute("data-highlighted", "true");
  });
});
