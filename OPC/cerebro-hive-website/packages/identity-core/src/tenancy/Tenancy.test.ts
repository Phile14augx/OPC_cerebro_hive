import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TenancyResolver } from "./Tenancy.ts";

describe("TenancyResolver", () => {
  it("formats an organization URN", () => {
    assert.equal(
      TenancyResolver.formatUrn({ organizationId: "acme" }),
      "urn:cerebro:org:acme"
    );
  });

  it("appends workspace, project, and environment segments", () => {
    assert.equal(
      TenancyResolver.formatUrn({
        organizationId: "acme",
        workspaceId: "ws-1",
        projectId: "proj-9",
        environmentId: "prod",
      }),
      "urn:cerebro:org:acme:ws:ws-1:proj:proj-9:env:prod"
    );
  });

  it("rejects a target outside the current organization", () => {
    assert.equal(
      TenancyResolver.isWithinScope(
        { organizationId: "acme" },
        { organizationId: "other" }
      ),
      false
    );
  });

  it("allows a target inside the current organization when no tighter scope is set", () => {
    assert.equal(
      TenancyResolver.isWithinScope(
        { organizationId: "acme", workspaceId: "ws-1" },
        { organizationId: "acme" }
      ),
      true
    );
  });
});
