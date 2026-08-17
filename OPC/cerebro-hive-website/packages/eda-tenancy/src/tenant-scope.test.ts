import { describe, expect, it } from "vitest";

import { MissingTenantContextError, verifyFromIdentity } from "./tenant-scope.js";

describe("verifyFromIdentity", () => {
  it("rejects an identity proof from a different organization", () => {
    const context = { orgId: "org-a", userId: "user-a", clearances: [] } as never;
    const proof = { orgId: "org-b", subject: "user-a", issuedAt: new Date() };
    expect(() => verifyFromIdentity(context, proof)).toThrow(MissingTenantContextError);
  });
});
