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

  it("uses the required deterministic executive fixture values", () => {
    const snapshot = getCerebroSphereSnapshot();

    expect(snapshot.kpis.map((kpi) => kpi.value)).toEqual(["$4.8M", "128", "99.98%", "18,426"]);
    expect(snapshot.products).toContainEqual(
      expect.objectContaining({ name: "HiveGateway", health: "Degraded" }),
    );
    expect(snapshot.alerts).toContainEqual(
      expect.objectContaining({
        title: "Gateway latency elevated",
        severity: "Warning",
        requiresAttention: true,
      }),
    );
    expect(snapshot.activities).toContainEqual(
      expect.objectContaining({
        state: "Completed",
        timestamp: "08:42 UTC",
        timestampIso: "2026-08-07T08:42:00Z",
      }),
    );
  });
});
