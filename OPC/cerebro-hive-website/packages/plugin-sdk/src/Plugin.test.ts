import { describe, expectTypeOf, it } from "vitest";

import type { CerebroPlugin, PluginMetadata } from "./Plugin";

describe("plugin SDK type contract", () => {
  it("requires lifecycle hooks and versioned metadata", () => {
    expectTypeOf<CerebroPlugin["onLoad"]>().toBeFunction();
    expectTypeOf<PluginMetadata>().toMatchTypeOf<{
      id: string;
      name: string;
      version: string;
      description: string;
    }>();
  });
});
