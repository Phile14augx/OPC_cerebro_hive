import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OperatingEmptyState } from "./OperatingEmptyState";
import { OperatingErrorState } from "./OperatingErrorState";

describe("operating system states", () => {
  it("offers a retry action for a failed graph request", () => {
    const retry = vi.fn();
    render(<OperatingErrorState error={new Error("Network unavailable")} onRetry={retry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable");
    screen.getByRole("button", { name: "Retry" }).click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it("routes an empty graph to agent creation", () => {
    render(<OperatingEmptyState actionHref="/app/agents" entity="organization graph" />);
    expect(screen.getByRole("link", { name: "Create an agent" })).toHaveAttribute("href", "/app/agents");
  });
});
