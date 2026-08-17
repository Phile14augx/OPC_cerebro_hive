import { describe, expect, it } from "vitest";

import { canonicalForm } from "./signature.js";

describe("canonicalForm", () => {
  it("sorts semantic fields into a stable canonical representation", () => {
    expect(
      canonicalForm([
        ["z", "last"],
        ["a", "first"],
      ]),
    ).toBe("a=first\u001fz=last");
  });
});
