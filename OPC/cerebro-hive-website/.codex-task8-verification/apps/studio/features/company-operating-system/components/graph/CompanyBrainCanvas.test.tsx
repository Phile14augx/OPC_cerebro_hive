import { fireEvent, render, screen } from "@testing-library/react";
import type { OperatingGraphSnapshot } from "@cerebro/shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompanyBrainCanvas } from "./CompanyBrainCanvas";
import { useOperatingWorkspaceStore } from "../../workspace/store";

const snapshot: OperatingGraphSnapshot = {
  revision: "test",
  generatedAt: "2026-08-10T00:00:00.000Z",
  mode: "demo",
  nodes: [
    { id: "company", type: "system", label: "Cerebro Hive", status: "healthy", departmentId: null, detailUrl: "/app/brain/company", tags: [], health: { score: 100, lastActivityAt: null }, summary: {} },
    { id: "department-research", type: "department", label: "Research", status: "healthy", departmentId: null, detailUrl: "/app/departments/research", tags: ["research"], health: { score: 100, lastActivityAt: null }, summary: {} },
    { id: "department-sales", type: "department", label: "Sales", status: "idle", departmentId: null, detailUrl: "/app/departments/sales", tags: ["sales"], health: { score: 90, lastActivityAt: null }, summary: {} },
    { id: "agent-builder", type: "agent", label: "Builder", status: "running", departmentId: "department-research", detailUrl: "/app/agents/builder", tags: ["research"], health: { score: 95, lastActivityAt: null }, summary: {} },
    { id: "tool-code", type: "tool", label: "Code", status: "healthy", departmentId: "department-research", detailUrl: "/app/tools/code", tags: [], health: { score: 100, lastActivityAt: null }, summary: {} },
  ],
  edges: [
    { id: "agent-builder-uses-tool-code", source: "agent-builder", target: "tool-code", relationship: "USES", status: "healthy", lastActivityAt: null, intensity: 1 },
  ],
};

describe("CompanyBrainCanvas", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    useOperatingWorkspaceStore.setState({
      selectedIds: [], inspectorId: null, focusId: null, query: "", nodeTypes: [],
      departments: [], relationships: [], labelsVisible: true, edgesVisible: true, fullscreen: false,
    });
  });

  it("selects a node in workspace state", () => {
    render(<CompanyBrainCanvas snapshot={snapshot} />);

    fireEvent.click(screen.getByRole("button", { name: "Agent: Builder" }));

    expect(useOperatingWorkspaceStore.getState().selectedIds).toEqual(["agent-builder"]);
  });

  it("filters nodes through graph search", () => {
    render(<CompanyBrainCanvas snapshot={snapshot} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "Search company brain" }), { target: { value: "research" } });

    expect(screen.getByRole("button", { name: "Department: Research" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Department: Sales" })).toBeNull();
  });

  it("keeps the company core as the anchor when a department filter is active", () => {
    render(<CompanyBrainCanvas snapshot={snapshot} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Filter department" }), { target: { value: "department-research" } });

    expect(screen.getByRole("button", { name: "System: Cerebro Hive" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Department: Research" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Department: Sales" })).toBeNull();
  });

  it("shows a non-committal preview while a graph entity is hovered", () => {
    render(<CompanyBrainCanvas snapshot={snapshot} />);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Agent: Builder" }));

    expect(screen.getByRole("status", { name: "Entity preview" })).toHaveTextContent("Builder");
    expect(useOperatingWorkspaceStore.getState().inspectorId).toBeNull();
  });

  it("makes the accessible detail action focus and inspect the entity", () => {
    render(<CompanyBrainCanvas snapshot={snapshot} />);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Agent: Builder" }));

    expect(useOperatingWorkspaceStore.getState()).toMatchObject({
      focusId: "agent-builder",
      inspectorId: "agent-builder",
    });
  });
});
