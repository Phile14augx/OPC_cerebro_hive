import { describe, expect, it } from "vitest";

import { canonicalHierName } from "./opensta-timing.js";

describe("canonicalHierName", () => {
  it("normalizes vendor hierarchy separators and array indices", () => {
    expect(canonicalHierName(" top.core\\lane[3].reg ")).toBe("top/corelane_3_/reg");
  });
});
