import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityInspector } from "./EntityInspector";
describe("EntityInspector", () => it("renders only safe entity data and an accessible close action", () => { render(<EntityInspector onClose={vi.fn()} detail={{ node: { id: "a", type: "agent", label: "Atlas", status: "running", departmentId: "research", detailUrl: "/a", tags: ["analysis"], health: { score: 10, lastActivityAt: null }, summary: {} }, metrics: { health: 10 }, relationships: [], actions: [] }} />); expect(screen.getByRole("dialog", { name: "Entity detail" })).toHaveTextContent("Atlas"); expect(screen.getByRole("button", { name: "Close" })).toBeVisible(); }));
