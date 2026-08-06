import type { DashboardSnapshot } from "./types";

export function getCerebroSphereSnapshot(): DashboardSnapshot {
  return {
    role: "CEO",
    kpis: [
      {
        label: "Revenue run rate",
        value: "$4.8M",
        trend: "up",
        comparison: "+12.4% vs last quarter",
      },
      {
        label: "Active enterprise tenants",
        value: "128",
        trend: "up",
        comparison: "+8 this month",
      },
      {
        label: "Platform availability",
        value: "99.98%",
        trend: "up",
        comparison: "Above 99.9% target",
      },
      {
        label: "Automations completed",
        value: "18,426",
        trend: "up",
        comparison: "+19% this week",
      },
    ],
    products: [
      {
        name: "CerebroStudio",
        health: "Healthy",
        availability: "99.99%",
        note: "All systems operational",
      },
      {
        name: "HiveGateway",
        health: "Degraded",
        availability: "99.72%",
        note: "Elevated inference latency",
      },
    ],
    activities: [
      {
        agent: "Release Guardian",
        summary: "Validated production release",
        timestamp: "08:42 UTC",
        timestampIso: "2026-08-07T08:42:00Z",
        state: "Completed",
      },
    ],
    alerts: [
      {
        title: "Gateway latency elevated",
        detail: "p95 inference latency is above the operating target.",
        severity: "Warning",
        requiresAttention: true,
      },
    ],
  };
}
