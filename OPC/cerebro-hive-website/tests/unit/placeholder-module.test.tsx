import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlaceholderModule } from "../../apps/studio/app/(platform)/app/components/ui/PlaceholderModule";

describe("PlaceholderModule", () => {
  it("renders the locked copy strings for a planned destination", () => {
    render(<PlaceholderModule group="Automation" title="Workflow Builder" status="planned" />);

    expect(screen.getByText("Automation / Workflow Builder")).toBeInTheDocument();
    expect(screen.getByText("Not yet available")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This module is part of the CerebroHive platform but is not enabled in this release."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Status: Planned")).toBeInTheDocument();
  });

  it("renders Status: Disabled for a disabled destination", () => {
    render(<PlaceholderModule group="Automation" title="Workflow Builder" status="disabled" />);

    expect(screen.getByText("Status: Disabled")).toBeInTheDocument();
  });

  it("never uses shadcn tokens forbidden in the platform tree", () => {
    const { container } = render(
      <PlaceholderModule group="Automation" title="Workflow Builder" status="planned" />
    );

    expect(container.querySelector(".text-foreground")).toBeNull();
    expect(container.querySelector(".text-muted-foreground")).toBeNull();
  });
});
