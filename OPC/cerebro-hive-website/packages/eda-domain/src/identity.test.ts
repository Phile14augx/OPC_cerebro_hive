import { describe, expect, it } from "vitest";

import { InvalidIdentifierError, OrgId } from "./identity.js";

describe("OrgId", () => {
  it("accepts a prefixed ULID and rejects an unscoped identifier", () => {
    expect(OrgId("org_01ARZ3NDEKTSV4RRFFQ69G5FAV")).toBe("org_01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(() => OrgId("01ARZ3NDEKTSV4RRFFQ69G5FAV")).toThrow(InvalidIdentifierError);
  });
});
