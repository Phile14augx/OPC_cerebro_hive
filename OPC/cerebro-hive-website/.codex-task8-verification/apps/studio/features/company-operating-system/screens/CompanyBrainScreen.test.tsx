import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CompanyBrainScreen } from "./CompanyBrainScreen";

const { useOperatingGraph } = vi.hoisted(() => ({ useOperatingGraph: vi.fn() }));

vi.mock("../data/queries", () => ({ useOperatingGraph }));
vi.mock("../realtime/useOperatingEvents", () => ({ useOperatingEvents: vi.fn() }));

describe("CompanyBrainScreen", () => {
  it("renders an explicit permission state for forbidden graph requests", () => {
    useOperatingGraph.mockReturnValue({
      isPending: false,
      isError: true,
      error: Object.assign(new Error("Forbidden"), { status: 403 }),
      refetch: vi.fn(),
    });

    render(<CompanyBrainScreen />);

    expect(screen.getByRole("alert")).toHaveTextContent("You do not have permission");
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
