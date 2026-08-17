import { describe, expect, it } from "vitest";

import { LifecycleStatus } from "../domain/Lifecycle";
import { CMDBRegistry } from "./CMDBRegistry";
import { InMemoryCMDBRepository } from "./InMemoryCMDBRepository";

describe("CMDBRegistry", () => {
  it("persists and retrieves a configuration item", async () => {
    const registry = new CMDBRegistry(new InMemoryCMDBRepository());
    await registry.registerCI({
      ciId: "ci-api",
      name: "API",
      type: "Microservice",
      businessCriticality: "BusinessCritical",
      lifecycleStatus: LifecycleStatus.Active,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
    });

    await expect(registry.getCI("ci-api")).resolves.toMatchObject({ ciId: "ci-api", name: "API" });
  });
});
