import { describe, expect, it } from "vitest";

import { InMemoryFeatureFlagService } from "./FeatureFlagService";

describe("InMemoryFeatureFlagService", () => {
  it("defaults unknown flags to disabled and returns configured variants", async () => {
    const flags = new InMemoryFeatureFlagService();
    expect(await flags.isEnabled("missing")).toBe(false);

    flags.setFlag("new-shell", true);
    flags.setVariant("new-shell", "treatment");

    expect(await flags.isEnabled("new-shell")).toBe(true);
    expect(await flags.getVariant("new-shell")).toBe("treatment");
  });
});
