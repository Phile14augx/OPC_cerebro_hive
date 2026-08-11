import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import OperatingSystemLayout from "../../../app/(platform)/app/(operating-system)/layout";
import { OperatingSystemShell } from "../components/shell/OperatingSystemShell";

describe("operating-system route composition", () => {
  it("renders one operating-system navigation boundary for a screen-owned shell", () => {
    render(
      <OperatingSystemLayout>
        <OperatingSystemShell mode="demo">
          <div>Brain canvas</div>
        </OperatingSystemShell>
      </OperatingSystemLayout>,
    );

    expect(screen.getAllByRole("navigation", { name: "Company operating system" })).toHaveLength(1);
    expect(screen.getByText("DEMO DATA")).toBeInTheDocument();
  });
});
