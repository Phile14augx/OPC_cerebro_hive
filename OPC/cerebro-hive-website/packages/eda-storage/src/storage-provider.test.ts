import { describe, expectTypeOf, it } from "vitest";

import type { StorageProvider, StorageTier } from "./storage-provider.js";

describe("storage provider type contract", () => {
  it("restricts storage tiers and requires the presign boundary", () => {
    expectTypeOf<StorageTier>().toEqualTypeOf<"hot" | "warm" | "cold">();
    expectTypeOf<StorageProvider["presignRead"]>().toBeFunction();
  });
});
