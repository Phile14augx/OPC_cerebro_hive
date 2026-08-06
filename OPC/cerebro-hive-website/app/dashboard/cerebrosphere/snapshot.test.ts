import { describe, expect, it } from "vitest";
import { getCerebroSphereSnapshot } from "./snapshot";

describe("getCerebroSphereSnapshot", () => {
  it("returns a CEO snapshot with every command-center data group", () => {
    const snapshot = getCerebroSphereSnapshot();
    expect(snapshot.role).toBe("CEO");
    expect(snapshot.kpis).toHaveLength(4);
    expect(snapshot.products.length).toBeGreaterThan(0);
    expect(snapshot.activities.length).toBeGreaterThan(0);
    expect(snapshot.alerts.length).toBeGreaterThan(0);
  });

  it("uses textual health and severity states", () => {
    const snapshot = getCerebroSphereSnapshot();
    expect(snapshot.products.every((item) => item.health.length > 0)).toBe(true);
    expect(snapshot.alerts.every((item) => item.severity.length > 0)).toBe(true);
  });
});
