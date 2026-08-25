import { NextRequest } from "next/server";
import assert from "node:assert/strict";
import { test } from "vitest";
import { AuthenticatedRequestContext } from "../lib/authenticated-request-context";

function request(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/twins/twin-a/versions", { headers });
}

test("missing credentials cannot resolve a request scope", async () => {
  const context = new AuthenticatedRequestContext({
    verifyToken: async () => {
      throw new Error("should not run");
    },
    authorizeWorkspace: async () => ({ authorized: true, role: "OWNER" }),
  });

  await assert.rejects(
    () => context.resolve(request({ "x-workspace-id": "workspace-a" }), "READ"),
    /UNAUTHENTICATED/,
  );
});

test("verified token tenant cannot be overridden by a spoofed tenant header", async () => {
  const authorizationInputs: unknown[] = [];
  const context = new AuthenticatedRequestContext({
    verifyToken: async () => ({ sub: "user-a", org_id: "tenant-a" }),
    authorizeWorkspace: async (input) => {
      authorizationInputs.push(input);
      return { authorized: true, role: "DEVELOPER" };
    },
  });

  const scope = await context.resolve(
    request({
      authorization: "Bearer valid",
      "x-tenant-id": "tenant-b",
      "x-workspace-id": "workspace-a",
    }),
    "WRITE",
  );

  assert.deepEqual(scope, { tenantId: "tenant-a", workspaceId: "workspace-a", userId: "user-a" });
  assert.deepEqual(authorizationInputs, [
    { tenantId: "tenant-a", workspaceId: "workspace-a", userId: "user-a" },
  ]);
});

test("tenant members cannot access a workspace outside their tenant", async () => {
  const context = new AuthenticatedRequestContext({
    verifyToken: async () => ({ sub: "user-a", org_id: "tenant-a" }),
    authorizeWorkspace: async () => ({ authorized: false, role: null }),
  });

  await assert.rejects(
    () =>
      context.resolve(
        request({ authorization: "Bearer valid", "x-workspace-id": "workspace-b" }),
        "READ",
      ),
    /FORBIDDEN/,
  );
});

test("read-only members cannot create or apply twin versions", async () => {
  const context = new AuthenticatedRequestContext({
    verifyToken: async () => ({ sub: "user-a", org_id: "tenant-a" }),
    authorizeWorkspace: async () => ({ authorized: true, role: "VIEWER" }),
  });

  await assert.rejects(
    () =>
      context.resolve(
        request({ authorization: "Bearer valid", "x-workspace-id": "workspace-a" }),
        "WRITE",
      ),
    /FORBIDDEN/,
  );
});

test("access token cookie is accepted through the canonical token verifier", async () => {
  let verifiedToken = "";
  const context = new AuthenticatedRequestContext({
    verifyToken: async (token) => {
      verifiedToken = token;
      return { sub: "user-a", org_id: "tenant-a" };
    },
    authorizeWorkspace: async () => ({ authorized: true, role: "VIEWER" }),
  });

  await context.resolve(
    request({ cookie: "access_token=cookie-token", "x-workspace-id": "workspace-a" }),
    "READ",
  );

  assert.equal(verifiedToken, "cookie-token");
});

test("bearer authentication scheme is case-insensitive", async () => {
  let verifiedToken = "";
  const context = new AuthenticatedRequestContext({
    verifyToken: async (token) => {
      verifiedToken = token;
      return { sub: "user-a", org_id: "tenant-a" };
    },
    authorizeWorkspace: async () => ({ authorized: true, role: "VIEWER" }),
  });

  await context.resolve(
    request({ authorization: "bearer lower-case-token", "x-workspace-id": "workspace-a" }),
    "READ",
  );

  assert.equal(verifiedToken, "lower-case-token");
});
