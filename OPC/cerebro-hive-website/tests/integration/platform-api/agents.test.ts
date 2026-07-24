/**
 * Integration tests — platform-api agent CRUD + runs
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const BASE   = process.env["PLATFORM_API_URL"] ?? "http://localhost:4000";
const prisma = new PrismaClient({ datasources: { db: { url: process.env["TEST_DATABASE_URL"] } } });

async function makeToken(orgId: string, userId: string, role = "DEVELOPER") {
  const secret = new TextEncoder().encode(process.env["TEST_JWT_SECRET"] ?? "test-secret-32-chars-minimum!!");
  return new SignJWT({ sub: userId, org_id: orgId, org_role: role, realm_access: { roles: [] }, resource_access: {} })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(secret);
}

let testOrg:   { id: string };
let testUser:  { id: string };
let authToken: string;

beforeAll(async () => {
  testOrg = await prisma.organization.create({
    data: { name: "Agent Test Org", slug: `agent-test-${Date.now()}`, plan: "pro" },
    select: { id: true },
  });
  testUser = await prisma.user.create({
    data: {
      email: `agent-test+${Date.now()}@test.com`,
      displayName: "Agent Tester",
      authType: "OIDC",
      status: "ACTIVE",
      memberships: { create: { orgId: testOrg.id, role: "OWNER" } },
    },
    select: { id: true },
  });
  authToken = await makeToken(testOrg.id, testUser.id, "OWNER");
});

afterAll(async () => {
  await prisma.organization.delete({ where: { id: testOrg.id } }).catch(() => { /* */ });
  await prisma.$disconnect();
});

async function api<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() as T };
}

describe("Agent CRUD", () => {
  let agentId: string;

  it("POST /v1/agents — creates an agent", async () => {
    const { status, data } = await api<{ id: string; name: string; status: string; version: string }>(
      "POST", "/v1/agents",
      {
        name:         "Test Agent",
        slug:         `test-agent-${Date.now()}`,
        description:  "An integration test agent",
        modelId:      "claude-haiku-4-5-20251001",
        instructions: "You are a test agent. Always respond with 'test ok'.",
        tools:        ["web_search"],
      },
    );

    expect(status).toBe(201);
    expect(data.name).toBe("Test Agent");
    expect(data.status).toBe("ACTIVE");
    agentId = data.id;
  });

  it("GET /v1/agents — lists agents", async () => {
    const { status, data } = await api<{ items: { id: string }[]; total: number }>(
      "GET", "/v1/agents",
    );
    expect(status).toBe(200);
    expect(data.items.some(a => a.id === agentId)).toBe(true);
  });

  it("GET /v1/agents/:id — retrieves agent by ID", async () => {
    const { status, data } = await api<{ id: string; name: string }>(
      "GET", `/v1/agents/${agentId}`,
    );
    expect(status).toBe(200);
    expect(data.id).toBe(agentId);
  });

  it("PATCH /v1/agents/:id — updates description", async () => {
    const { status, data } = await api<{ description: string }>(
      "PATCH", `/v1/agents/${agentId}`,
      { description: "Updated description" },
    );
    expect(status).toBe(200);
    expect(data.description).toBe("Updated description");
  });

  it("GET /v1/agents?search=Test — search works", async () => {
    const { data } = await api<{ items: { name: string }[] }>(
      "GET", "/v1/agents?search=Test",
    );
    expect(data.items.some(a => a.name.includes("Test"))).toBe(true);
  });

  it("DELETE /v1/agents/:id — deletes agent", async () => {
    const { status } = await api("DELETE", `/v1/agents/${agentId}`);
    expect(status).toBe(204);
  });

  it("GET /v1/agents/:id — returns 404 after deletion", async () => {
    const { status } = await api("GET", `/v1/agents/${agentId}`);
    expect(status).toBe(404);
  });
});

describe("Agent validation", () => {
  it("POST /v1/agents without name returns 422", async () => {
    const { status } = await api("POST", "/v1/agents", { description: "No name" });
    expect(status).toBe(422);
  });

  it("POST /v1/agents with duplicate slug returns 409", async () => {
    const slug = `unique-slug-${Date.now()}`;
    await api("POST", "/v1/agents", { name: "First", slug });
    const { status } = await api("POST", "/v1/agents", { name: "Second", slug });
    expect([409, 422]).toContain(status);
  });
});

describe("Agent pagination", () => {
  const createdIds: string[] = [];

  beforeAll(async () => {
    for (let i = 0; i < 5; i++) {
      const { data } = await api<{ id: string }>(
        "POST", "/v1/agents",
        { name: `Paginate Agent ${i}`, slug: `paginate-${Date.now()}-${i}` },
      );
      createdIds.push(data.id);
    }
  });

  afterAll(async () => {
    await Promise.all(createdIds.map(id => api("DELETE", `/v1/agents/${id}`)));
  });

  it("limit param restricts result count", async () => {
    const { data } = await api<{ items: unknown[] }>("GET", "/v1/agents?limit=2");
    expect(data.items.length).toBeLessThanOrEqual(2);
  });

  it("page=2 with limit=2 returns different results than page=1", async () => {
    const page1 = await api<{ items: { id: string }[] }>("GET", "/v1/agents?limit=2&page=1");
    const page2 = await api<{ items: { id: string }[] }>("GET", "/v1/agents?limit=2&page=2");

    const ids1 = page1.data.items.map(a => a.id);
    const ids2 = page2.data.items.map(a => a.id);
    expect(ids1).not.toEqual(ids2);
  });
});
