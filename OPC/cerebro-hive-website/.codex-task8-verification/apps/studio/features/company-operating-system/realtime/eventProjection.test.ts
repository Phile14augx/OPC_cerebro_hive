import { describe, expect, it } from "vitest";
import { projectOperatingEvent } from "./eventProjection";

describe("projectOperatingEvent", () => it("projects an authorized status update without removing graph state", () => {
  const snapshot = { revision: "r", generatedAt: "old", mode: "live" as const, nodes: [{ id: "a", type: "agent" as const, label: "A", status: "idle" as const, departmentId: null, detailUrl: "/a", tags: [], health: { score: null, lastActivityAt: null }, summary: {} }], edges: [] };
  expect(projectOperatingEvent(snapshot, { id: "1", event: "execution", data: { targetId: "a", status: "running" } }).nodes[0].status).toBe("running");
}));
