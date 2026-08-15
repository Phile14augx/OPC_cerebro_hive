import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIGIT_VIEWS, NAV_ORDER } from "../lib/nav";

describe("nav", () => {
  it("keeps command palette digits aligned with visible order", () => {
    assert.deepEqual(DIGIT_VIEWS, NAV_ORDER.slice(0, 9));
    assert.equal(NAV_ORDER[0], "/");
    assert.equal(NAV_ORDER.includes("/org"), true);
    assert.equal(NAV_ORDER.includes("/brain"), true);
    assert.equal(NAV_ORDER.includes("/integrations"), true);
  });
});
