import { describe, expect, it } from "vitest";

import { rawGraphQuery } from "./graph-sql.js";

describe("rawGraphQuery", () => {
  it("fails closed while the internal graph backend is unavailable", () => {
    expect(() => rawGraphQuery("select 1")).toThrow("not implemented — Phase 4");
  });
});
