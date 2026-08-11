import type { OperatingGraphSnapshot } from "@cerebro/shared-types";
import { describe, expect, it } from "vitest";

import { layoutCompanyBrain } from "./radialLayout";
import { createOperatingSearchIndex } from "./searchIndex";
import { toReactFlowGraph } from "./toReactFlow";

const snapshot: OperatingGraphSnapshot = {
  revision: "test-revision",
  generatedAt: "2026-08-10T00:00:00.000Z",
  mode: "demo",
  nodes: [
    node("agent-builder", "agent", "department-tech"),
    node("resource-docs", "data-source", "department-tech"),
    node("department-sales", "department", null),
    node("department-tech", "department", null),
    node("agent-seller", "agent", "department-sales"),
    node("orphan-tool", "tool", null),
  ],
  edges: [
    {
      id: "edge-builder-docs",
      source: "agent-builder",
      target: "resource-docs",
      relationship: "READS_FROM",
      status: "healthy",
      lastActivityAt: null,
      intensity: 0.8,
    },
  ],
};

function node(
  id: string,
  type: OperatingGraphSnapshot["nodes"][number]["type"],
  departmentId: string | null,
) {
  return {
    id,
    type,
    departmentId,
    label: id,
    status: "healthy" as const,
    detailUrl: `/entities/${id}`,
    tags: id === "agent-builder" ? ["engineering"] : [],
    health: { score: 100, lastActivityAt: null },
    summary: {},
  };
}

function distanceFromCenter(
  positioned: ReturnType<typeof layoutCompanyBrain>[number],
  viewport = { width: 1200, height: 800 },
) {
  return Math.hypot(
    positioned.position.x - viewport.width / 2,
    positioned.position.y - viewport.height / 2,
  );
}

describe("layoutCompanyBrain", () => {
  it("returns stable positions for identical snapshots", () => {
    expect(layoutCompanyBrain(snapshot, { width: 1200, height: 800 })).toEqual(
      layoutCompanyBrain(snapshot, { width: 1200, height: 800 }),
    );
  });

  it("places the persisted system core at the viewport center", () => {
    const coreSnapshot: OperatingGraphSnapshot = {
      ...snapshot,
      nodes: [node("system-company", "system", null), ...snapshot.nodes],
    };

    const positions = layoutCompanyBrain(coreSnapshot, { width: 1200, height: 800 });

    expect(positions.find((position) => position.id === "system-company")?.position).toEqual({
      x: 600,
      y: 400,
    });
  });

  it("keeps every emitted node center inside a one-pixel viewport", () => {
    const viewport = { width: 1, height: 1 };

    for (const positioned of layoutCompanyBrain(snapshot, viewport)) {
      expect(positioned.position.x).toBeGreaterThanOrEqual(0);
      expect(positioned.position.x).toBeLessThanOrEqual(viewport.width);
      expect(positioned.position.y).toBeGreaterThanOrEqual(0);
      expect(positioned.position.y).toBeLessThanOrEqual(viewport.height);
    }
  });

  it("sorts entities by stable id before positioning", () => {
    const positions = layoutCompanyBrain(snapshot, { width: 1200, height: 800 });

    expect(positions.map(({ id }) => id)).toEqual([
      "department-sales",
      "department-tech",
      "agent-seller",
      "agent-builder",
      "resource-docs",
      "orphan-tool",
    ]);
  });

  it("places departments closer to the core than their agents and resources", () => {
    const positions = layoutCompanyBrain(snapshot, { width: 1200, height: 800 });
    const byId = new Map(positions.map((position) => [position.id, position]));

    expect(distanceFromCenter(byId.get("department-tech")!)).toBeLessThan(
      distanceFromCenter(byId.get("agent-builder")!),
    );
    expect(distanceFromCenter(byId.get("agent-builder")!)).toBeLessThan(
      distanceFromCenter(byId.get("resource-docs")!),
    );
  });

  it("maps entity IDs and relationship semantics to animated React Flow elements", () => {
    const graph = toReactFlowGraph(
      snapshot,
      layoutCompanyBrain(snapshot, { width: 1200, height: 800 }),
    );

    expect(graph.nodes.find((item) => item.id === "agent-builder")).toMatchObject({
      id: "agent-builder",
      type: "operating-agent",
      data: expect.objectContaining({ entityId: "agent-builder" }),
    });
    expect(graph.edges).toEqual([
      expect.objectContaining({
        id: "edge-builder-docs",
        source: "agent-builder",
        target: "resource-docs",
        type: "operating-semantic",
        animated: true,
        data: expect.objectContaining({ relationship: "READS_FROM" }),
      }),
    ]);
  });

  it("indexes labels, tags, and types without changing graph entity IDs", () => {
    const index = createOperatingSearchIndex(snapshot.nodes);

    expect(index.search("engineering").map((result) => result.id)).toEqual([
      "agent-builder",
    ]);
    expect(index.search("data source").map((result) => result.id)).toEqual([
      "resource-docs",
    ]);
  });
});
