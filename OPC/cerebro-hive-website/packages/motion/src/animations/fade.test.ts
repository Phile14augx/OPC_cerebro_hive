import { describe, expect, it } from "vitest";

import { fade } from "./fade";

describe("fade animation", () => {
  it("moves from transparent to visible and back to transparent", () => {
    expect(fade).toEqual({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    });
  });
});
