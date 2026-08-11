import { describe, expect, it } from "vitest";
import { isOperatingNodeType } from "@cerebro/shared-types";

describe("operating-system contracts", () => {
  it("accepts only supported graph node categories", () => {
    expect(isOperatingNodeType("agent")).toBe(true);
    expect(isOperatingNodeType("memory")).toBe(true);
    expect(isOperatingNodeType("dashboard-card")).toBe(false);
    expect(isOperatingNodeType(null)).toBe(false);
  });
});
