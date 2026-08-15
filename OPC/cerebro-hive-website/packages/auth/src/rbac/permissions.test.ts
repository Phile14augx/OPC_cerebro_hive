import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getPermissions, hasPermission, highestRole } from "./permissions.ts";

describe("hasPermission", () => {
  it("grants OWNER org:delete and denies VIEWER org:delete", () => {
    assert.equal(hasPermission("OWNER", "org:delete"), true);
    assert.equal(hasPermission("VIEWER", "org:delete"), false);
  });

  it("lets DEVELOPER execute workflows but not delete the org", () => {
    assert.equal(hasPermission("DEVELOPER", "workflows:execute"), true);
    assert.equal(hasPermission("DEVELOPER", "org:delete"), false);
  });
});

describe("getPermissions", () => {
  it("returns a non-empty list for VIEWER that includes org:read", () => {
    const perms = getPermissions("VIEWER");
    assert.ok(perms.includes("org:read"));
    assert.equal(perms.includes("org:delete"), false);
  });
});

describe("highestRole", () => {
  it("picks OWNER over lower roles and returns null for an empty list", () => {
    assert.equal(highestRole(["VIEWER", "OWNER", "DEVELOPER"]), "OWNER");
    assert.equal(highestRole([]), null);
  });
});
