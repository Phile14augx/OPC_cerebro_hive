import { describe, expect, it } from "vitest";

import { createOperatingWorkspaceStore } from "./store";
import {
  parseWorkspaceState,
  serializeWorkspaceState,
  type OperatingWorkspaceUrlState,
  workspaceUrlDefaults,
} from "./urlState";

describe("operating workspace state", () => {
  it("dismisses the inspector before clearing focus", () => {
    const store = createOperatingWorkspaceStore({
      selectedIds: ["agent-a"],
      inspectorId: "agent-a",
      focusId: "department-tech",
    });

    store.getState().dismissTopLayer();

    expect(store.getState().inspectorId).toBeNull();
    expect(store.getState().focusId).toBe("department-tech");
  });

  it("dismisses focus only after the inspector is closed", () => {
    const store = createOperatingWorkspaceStore({ focusId: "department-tech" });

    store.getState().dismissTopLayer();

    expect(store.getState().focusId).toBeNull();
  });

  it("keeps every named filter and display preference in workspace state", () => {
    const store = createOperatingWorkspaceStore();

    expect(store.getState()).toMatchObject({
      selectedIds: [],
      inspectorId: null,
      focusId: null,
      query: "",
      nodeTypes: [],
      departments: [],
      relationships: [],
      labelsVisible: true,
      edgesVisible: true,
      fullscreen: false,
    });
  });
});

describe("workspace URL state", () => {
  it("round-trips serializable workspace filters through a safe URL format", () => {
    const value = {
      selectedIds: ["agent-a"],
      inspectorId: "agent-a",
      focusId: "department-tech",
      query: "build",
      nodeTypes: ["agent", "tool"],
      departments: ["department-tech"],
      relationships: ["USES", "READS_FROM"],
      labelsVisible: false,
      edgesVisible: true,
      fullscreen: true,
    } satisfies OperatingWorkspaceUrlState;

    expect(parseWorkspaceState(serializeWorkspaceState(value))).toEqual(value);
  });

  it("returns safe defaults when URL values fail Zod validation", () => {
    expect(parseWorkspaceState("?nodeTypes=not-a-node&fullscreen=definitely")).toEqual(
      workspaceUrlDefaults,
    );
  });
});
