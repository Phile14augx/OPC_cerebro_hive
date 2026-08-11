import { NextRequest } from "next/server";
import assert from "node:assert/strict";
import test from "node:test";
import { generateIndustryModel } from "../modules/industry/deterministic-industry-provider";
import { createVersionRouteController } from "../modules/twin-definition/version-route-controller";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", userId: "user-a" };

function post(body: string) {
  return new NextRequest("http://localhost/api/twins/twin-route/versions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

function controller() {
  const calls: unknown[] = [];
  const route = createVersionRouteController({
    resolveScope: async (_request, access) => {
      calls.push({ access });
      return scope;
    },
    service: {
      createProposal: async (...args) => {
        calls.push({ create: args });
        return { id: "proposal-a", status: "PREVIEW" };
      },
      applyProposal: async (...args) => {
        calls.push({ apply: args });
        return { id: "version-a", status: "PUBLISHED" };
      },
      listVersions: async (...args) => {
        calls.push({ list: args });
        return [];
      },
    },
  });
  return { route, calls };
}

test("malformed JSON is returned as a stable validation error", async () => {
  const { route } = controller();
  const response = await route.POST(post("{"), "twin-route");

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "VALIDATION_ERROR");
});

test("unknown version actions are rejected", async () => {
  const { route } = controller();
  const response = await route.POST(post(JSON.stringify({ action: "DELETE_ALL" })), "twin-route");

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "VALIDATION_ERROR");
});

test("malformed preview models are rejected before reaching the service", async () => {
  const { route, calls } = controller();
  const response = await route.POST(
    post(JSON.stringify({ action: "CREATE_PREVIEW", model: { status: "PREVIEW" } })),
    "twin-route",
  );

  assert.equal(response.status, 400);
  assert.equal(
    calls.some((item: any) => item.create),
    false,
  );
});

test("APPLY is bound to the URL twin and requires explicit approval", async () => {
  const { route, calls } = controller();
  const response = await route.POST(
    post(JSON.stringify({ action: "APPLY", proposalId: "proposal-a", approved: true })),
    "twin-route",
  );

  assert.equal(response.status, 200);
  assert.deepEqual(
    calls.find((item: any) => item.apply),
    {
      apply: [
        { tenantId: "tenant-a", workspaceId: "workspace-a" },
        "twin-route",
        "proposal-a",
        true,
      ],
    },
  );
});

test("preview creation accepts a validated generated model", async () => {
  const { route, calls } = controller();
  const model = generateIndustryModel({
    domain: "Airport",
    description: "International airport operations.",
  });
  const response = await route.POST(
    post(JSON.stringify({ action: "CREATE_PREVIEW", model })),
    "twin-route",
  );

  assert.equal(response.status, 201);
  assert.equal(
    calls.some((item: any) => item.create),
    true,
  );
});

test("unexpected infrastructure errors are returned as a generic 500", async () => {
  const route = createVersionRouteController({
    resolveScope: async () => scope,
    service: {
      createProposal: async () => {
        throw new Error("postgres://user:secret@db");
      },
      applyProposal: async () => {
        throw new Error("should not run");
      },
      listVersions: async () => [],
    },
  });

  const response = await route.POST(
    post(
      JSON.stringify({
        action: "CREATE_PREVIEW",
        model: generateIndustryModel({
          domain: "Airport",
          description: "International airport operations and infrastructure.",
        }),
      }),
    ),
    "twin-route",
  );
  const payload = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(payload.error, { code: "INTERNAL_ERROR", message: "Unexpected server error." });
  assert.equal(JSON.stringify(payload).includes("secret"), false);
});
