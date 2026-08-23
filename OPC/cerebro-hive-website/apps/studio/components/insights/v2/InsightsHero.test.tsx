import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InsightsHero } from "./InsightsHero";

describe("InsightsHero initial render contract", () => {
  it("renders intelligence metrics, calls to action, and the scanning animation immediately", () => {
    const { container } = render(<InsightsHero />);

    expect(screen.getByRole("heading", { name: /Enterprise AI Intelligence/i })).toBeTruthy();
    expect(screen.getByText("AI Adoption")).toBeTruthy();
    expect(screen.getByText("76%")).toBeTruthy();
    expect(screen.getByText("Enterprise Spending")).toBeTruthy();
    expect(screen.getByText("$14B")).toBeTruthy();
    expect(screen.getByText("Read Weekly Brief")).toBeTruthy();
    expect(screen.getByText("Explore Dashboards")).toBeTruthy();

    expect(
      container.querySelector(
        ".bg-gradient-to-b.from-transparent.via-\\[\\#00E5FF\\]\\/10.to-transparent",
      ),
    ).toBeTruthy();
  });
});
