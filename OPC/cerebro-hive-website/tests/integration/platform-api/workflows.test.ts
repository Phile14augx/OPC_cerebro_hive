/**
 * Integration tests — platform-api workflow CRUD + execution lifecycle
 *
 * Requires:
 *   - TEST_DATABASE_URL pointing to a test PostgreSQL instance
 *   - PLATFORM_API_URL (default: http://localhost:4000)
 *   - TEST_JWT_SECRET (for signing test tokens)
 *
 * Run: pnpm test:integration
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@cerebro/db";
import { SignJWT } from "jose";

const BASE = process.env["PLATFORM_API_URL"] ?? "http://localhost:4000";
const prisma = new PrismaClient({ datasources: { db: { url: process.env["TEST_DATABASE_URL"] } } });

// ── Token factory ─────────────────────────────────────────────────────────────

async function makeToken(orgId: string, userId: string, orgRole = "DEVELOPER") {
  const secret = new TextEncoder().encode(process.env["TEST_JWT_SECRET"] ?? "test-secret-32-chars-minimum!!");
  return new SignJWT({
    sub:      userId,
    org_id:   orgId,
    org_role: orgRole,
    realm_access:    { roles: [] },
    resource_access: {},
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

let testOrg:    { id: string };
let testUser:   { id: string };
let adminToken: string;

beforeAll(async () => {
  // Create test org + user
  testOrg = await prisma.organization.create({
    data: {
      name: "Integration Test Org",
      slug: `test-org-${Date.now()}`,
      plan: "pro",
    },
    select: { id: true },
  });

  testUser = await prisma.user.create({
    data: {
      email:       `test+${Date.now()}@example.com`,
      displayName: "Test User",
      authType:    "OIDC",
      status:      "ACTIVE",
      memberships: {
        create: { orgId: testOrg.id, role: "OWNER" },
      },
    },
    select: { id: true },
  });

  adminToken = await makeToken(testOrg.id, testUser.id, "OWNER");
});

afterAll(async () => {
  // Cascade delete test org (removes all related records via FK cascade)
  await prisma.organization.delete({ where: { id: testOrg.id } }).catch(() => { /* ignore if already gone */ });
  await prisma.$disconnect();
});

// ── Helper ────────────────────────────────────────────────────────────────────

async function api<T = unknown>(
  method: string,
  path:   string,
  body?:  unknown,
  token = adminToken,
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
      "X-Trace-ID":    `test-${Date.now()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: T;
  try {
    data = await res.json() as T;
  } catch {
    data = undefined as unknown as T;
  }

  return { status: res.status, data };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await fetch(`${BASE}/health`);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("ok");
  });
});

describe("Workflow CRUD", () => {
  let workflowId: string;

  it("POST /v1/workflows — creates a draft workflow", async () => {
    const { status, data } = await api<{ id: string; status: string; name: string }>(
      "POST", "/v1/workflows",
      { name: "Test Workflow", description: "Created in integration test", tags: ["test"] },
    );

    expect(status).toBe(201);
    expect(data.status).toBe("DRAFT");
    expect(data.name).toBe("Test Workflow");
    workflowId = data.id;
  });

  it("GET /v1/workflows — lists workflows including the new one", async () => {
    const { status, data } = await api<{ items: { id: string }[]; total: number }>(
      "GET", `/v1/workflows?limit=100`,
    );

    expect(status).toBe(200);
    expect(data.items.some(w => w.id === workflowId)).toBe(true);
    expect(data.total).toBeGreaterThanOrEqual(1);
  });

  it("GET /v1/workflows/:id — returns the specific workflow", async () => {
    const { status, data } = await api<{ id: string; status: string }>(
      "GET", `/v1/workflows/${workflowId}`,
    );

    expect(status).toBe(200);
    expect(data.id).toBe(workflowId);
    expect(data.status).toBe("DRAFT");
  });

  it("PATCH /v1/workflows/:id — updates name and tags", async () => {
    const { status, data } = await api<{ name: string; tags: string[] }>(
      "PATCH", `/v1/workflows/${workflowId}`,
      { name: "Updated Workflow Name", tags: ["test", "updated"] },
    );

    expect(status).toBe(200);
    expect(data.name).toBe("Updated Workflow Name");
    expect(data.tags).toContain("updated");
  });

  it("POST /v1/workflows/:id/publish — publishes the workflow", async () => {
    const { status, data } = await api<{ status: string; publishedAt: string }>(
      "POST", `/v1/workflows/${workflowId}/publish`,
    );

    expect(status).toBe(200);
    expect(data.status).toBe("PUBLISHED");
    expect(data.publishedAt).toBeTruthy();
  });

  it("GET /v1/workflows?status=PUBLISHED — filters correctly", async () => {
    const { status, data } = await api<{ items: { id: string; status: string }[] }>(
      "GET", `/v1/workflows?status=PUBLISHED`,
    );

    expect(status).toBe(200);
    expect(data.items.every(w => w.status === "PUBLISHED")).toBe(true);
    expect(data.items.some(w => w.id === workflowId)).toBe(true);
  });

  it("POST /v1/workflows/:id/execute — queues an execution", async () => {
    const { status, data } = await api<{ id: string; status: string; triggerType: string }>(
      "POST", `/v1/workflows/${workflowId}/execute`,
      { input: { test: true }, testMode: true },
    );

    expect(status).toBe(202);
    expect(data.status).toBe("QUEUED");
    expect(data.triggerType).toBe("api");
  });

  it("GET /v1/workflows/:id/executions — lists executions", async () => {
    const { status, data } = await api<{ items: { workflowId: string }[]; total: number }>(
      "GET", `/v1/workflows/${workflowId}/executions`,
    );

    expect(status).toBe(200);
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.items[0]?.workflowId).toBe(workflowId);
  });

  it("POST /v1/workflows/:id/archive — archives the workflow", async () => {
    const { status, data } = await api<{ status: string }>(
      "POST", `/v1/workflows/${workflowId}/archive`,
    );

    expect(status).toBe(200);
    expect(data.status).toBe("ARCHIVED");
  });

  it("DELETE /v1/workflows/:id — soft-deletes", async () => {
    const { status } = await api("DELETE", `/v1/workflows/${workflowId}`);
    expect(status).toBe(204);
  });

  it("GET /v1/workflows/:id — returns 404 after delete", async () => {
    const { status } = await api("GET", `/v1/workflows/${workflowId}`);
    expect(status).toBe(404);
  });
});

describe("Workflow search + filtering", () => {
  const wfIds: string[] = [];

  beforeAll(async () => {
    // Create a batch for filter testing
    for (const name of ["Alpha Workflow", "Beta Workflow", "Gamma Process"]) {
      const { data } = await api<{ id: string }>(
        "POST", "/v1/workflows",
        { name, tags: name.includes("Workflow") ? ["test-filter"] : ["test-other"] },
      );
      wfIds.push(data.id);
    }
  });

  afterAll(async () => {
    await Promise.all(wfIds.map(id => api("DELETE", `/v1/workflows/${id}`)));
  });

  it("search param filters by name substring", async () => {
    const { data } = await api<{ items: { name: string }[] }>("GET", "/v1/workflows?search=Workflow");
    expect(data.items.every(w => w.name.includes("Workflow"))).toBe(true);
  });

  it("tags param filters by tag", async () => {
    const { data } = await api<{ items: { tags: string[] }[] }>("GET", "/v1/workflows?tags=test-filter");
    expect(data.items.every(w => w.tags.includes("test-filter"))).toBe(true);
  });
});

describe("Execution lifecycle", () => {
  let wfId:    string;
  let execId:  string;

  beforeAll(async () => {
    const { data } = await api<{ id: string }>(
      "POST", "/v1/workflows",
      { name: "Lifecycle Test Workflow" },
    );
    wfId = data.id;
    await api("POST", `/v1/workflows/${wfId}/publish`);
    const { data: exec } = await api<{ id: string }>(
      "POST", `/v1/workflows/${wfId}/execute`,
      { input: { msg: "hello" } },
    );
    execId = exec.id;
  });

  afterAll(async () => {
    await api("DELETE", `/v1/workflows/${wfId}`);
  });

  it("GET /v1/workflows/executions/:execId — returns execution", async () => {
    const { status, data } = await api<{ id: string; status: string }>(
      "GET", `/v1/workflows/executions/${execId}`,
    );
    expect(status).toBe(200);
    expect(data.id).toBe(execId);
    expect(["QUEUED", "RUNNING"]).toContain(data.status);
  });

  it("POST /v1/workflows/executions/:execId/cancel — cancels execution", async () => {
    const { status, data } = await api<{ status: string }>(
      "POST", `/v1/workflows/executions/${execId}/cancel`,
    );
    expect(status).toBe(200);
    expect(data.status).toBe("CANCELLED");
  });

  it("cancel is idempotent — returns 409 on re-cancel", async () => {
    const { status } = await api(
      "POST", `/v1/workflows/executions/${execId}/cancel`,
    );
    expect(status).toBe(409);
  });
});

describe("Auth enforcement", () => {
  it("returns 401 without a token", async () => {
    const res = await fetch(`${BASE}/v1/workflows`, {
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 for VIEWER trying to create workflow", async () => {
    const viewerToken = await makeToken(testOrg.id, testUser.id, "VIEWER");
    const { status } = await api<unknown>(
      "POST", "/v1/workflows", { name: "Forbidden" }, viewerToken,
    );
    expect(status).toBe(403);
  });

  it("returns 401 with invalid token", async () => {
    const res = await fetch(`${BASE}/v1/workflows`, {
      headers: { Authorization: "Bearer invalid.jwt.token" },
    });
    expect(res.status).toBe(401);
  });
});

describe("Input validation", () => {
  it("POST /v1/workflows without name returns 422", async () => {
    const { status, data } = await api<{ error: string }>(
      "POST", "/v1/workflows", {},
    );
    expect(status).toBe(422);
    expect(data.error).toBeTruthy();
  });

  it("GET /v1/workflows with non-numeric page returns gracefully", async () => {
    const { status } = await api("GET", "/v1/workflows?page=abc");
    // Should either 400 or ignore and default to page 1
    expect([200, 400]).toContain(status);
  });
});

describe("Cross-org isolation", () => {
  let otherOrgId: string;
  let otherOrgToken: string;
  let wfInMainOrg: string;

  beforeAll(async () => {
    // Second org
    const otherOrg = await prisma.organization.create({
      data: {
        name: "Other Org",
        slug: `other-org-${Date.now()}`,
        plan: "starter",
      },
    });
    otherOrgId = otherOrg.id;

    const otherUser = await prisma.user.create({
      data: {
        email:    `other+${Date.now()}@example.com`,
        displayName: "Other User",
        authType: "OIDC",
        status:   "ACTIVE",
        memberships: { create: { orgId: otherOrgId, role: "OWNER" } },
      },
    });
    otherOrgToken = await makeToken(otherOrgId, otherUser.id, "OWNER");

    // Create wf in main org
    const { data } = await api<{ id: string }>(
      "POST", "/v1/workflows", { name: "Main Org Workflow" },
    );
    wfInMainOrg = data.id;
  });

  afterAll(async () => {
    await prisma.organization.delete({ where: { id: otherOrgId } }).catch(() => { /* */ });
    await api("DELETE", `/v1/workflows/${wfInMainOrg}`);
  });

  it("user from other org cannot read main org workflow", async () => {
    const { status } = await api(
      "GET", `/v1/workflows/${wfInMainOrg}`, undefined, otherOrgToken,
    );
    expect(status).toBe(404); // not visible, not 403 (prevents information leakage)
  });

  it("listing from other org returns empty (not main org workflows)", async () => {
    const { data } = await api<{ items: { id: string }[] }>(
      "GET", "/v1/workflows", undefined, otherOrgToken,
    );
    expect(data.items.some((w) => w.id === wfInMainOrg)).toBe(false);
  });
});
