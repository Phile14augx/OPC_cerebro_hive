import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CerebroSphereDashboard } from "./CerebroSphereDashboard";
import { getCerebroSphereSnapshot } from "./snapshot";

describe("CerebroSphereDashboard", () => {
  it("renders the four executive command-center areas", () => {
    render(<CerebroSphereDashboard snapshot={getCerebroSphereSnapshot()} />);
    expect(screen.getByRole("heading", { name: /cerebrosphere/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /business kpis/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /product health/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /agent activity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /system alerts/i })).toBeInTheDocument();

    expect(screen.getByText("$4.8M")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(screen.getByText("99.98%")).toBeInTheDocument();
    expect(screen.getByText("18,426")).toBeInTheDocument();
    expect(screen.getByText("HiveGateway")).toBeInTheDocument();
    expect(screen.getByText("Health: Degraded")).toBeInTheDocument();
    expect(screen.getByText("Gateway latency elevated")).toBeInTheDocument();
    expect(screen.getByText("Severity: Warning")).toBeInTheDocument();
    expect(screen.getByText("Action required")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("08:42 UTC").tagName).toBe("TIME");
    expect(screen.getByText("08:42 UTC")).toHaveAttribute("dateTime", "2026-08-07T08:42:00Z");
  });
});
