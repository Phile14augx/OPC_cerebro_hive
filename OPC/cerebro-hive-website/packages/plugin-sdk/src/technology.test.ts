import { describe, expect, it } from "vitest";
import { technologyRegistry } from "./technology";

describe("TechnologyRegistry", () => {
  it("returns stable ids without switch-statement lookups", () => {
    expect(technologyRegistry.get("react")?.supportTier).toBe(1);
    expect(technologyRegistry.get("pinecone")?.supportTier).toBe(3);
    expect(technologyRegistry.byCategory("backend").map((item) => item.id)).toContain("spring-boot");
  });

  it("does not mark credential-gated cloud runtimes as locally executable", () => {
    expect(technologyRegistry.get("pinecone")?.runtime?.supported).toBe(false);
    expect(technologyRegistry.get("kubernetes")?.supportTier).toBe(3);
  });

  it("does not claim generators or local runtimes until Day 2+ adapters exist", () => {
    expect(technologyRegistry.get("react")?.generator?.supported).toBe(false);
    expect(technologyRegistry.get("spring-boot")?.generator?.supported).toBe(false);
    expect(technologyRegistry.get("react")?.runtime?.supported).toBe(false);
  });
});
