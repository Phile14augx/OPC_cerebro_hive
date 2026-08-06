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
  });
});
