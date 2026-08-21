/**
 * Integration tests — API key auth + lifecycle
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@cerebro/db";
import { SignJWT } from "jose";
const BASE   = process.env["PLATFORM_API_URL"] ?? "http://localhost:4000";
const prisma = new PrismaClient({ datasources: { db: { url: process.env["TEST_DATABASE_URL"] } } });

async function makeBearerToken(orgId: string, userId: string) {
  const secret = new TextEncoder().encode(process.env["TEST_JWT_SECRET"] ?? "test-secret-32-chars-minimum!!");
  return new SignJWT({ sub: userId, org_id: orgId, org_role: "OWNER", realm_access: { roles: [] }, resource_access: {} })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

let testOrg:   { id: string };
let testUser:  { id: string };
let jwtToken:  string;
let createdKeyId:  string;
let rawApiKey:     string;

beforeAll(async () => {
  testOrg = await prisma.organization.create({
    data: { name: "APIKey Test Org", slug: `apikey-test-${Date.now()}`, plan: "pro" },
    select: { id: true },
  });
  testUser = await prisma.user.create({
    data: {
      email: `apikey+${Date.now()}@test.com`,
      displayName: "APIKey Tester",
      authType: "OIDC",
      status: "ACTIVE",
      memberships: { create: { orgId: testOrg.id, role: "OWNER" } },
    },
    select: { id: true },
  });
  jwtToken = await makeBearerToken(testOrg.id, testUser.id);
});

afterAll(async () => {
  await prisma.organization.delete({ where: { id: testOrg.id } }).catch(() => { /* */ });
  await prisma.$disconnect();
});

async function apiWithJWT<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwtToken}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() as T };
}

async function apiWithKey<T>(method: string, path: string, apiKey: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() as T };
}

describe("API Key lifecycle", () => {
  it("POST /v1/api-keys — creates a new key", async () => {
    const { status, data } = await apiWithJWT<{ raw: string; id: string; prefix: string }>(
      "POST", "/v1/api-keys",
      { name: "Integration Test Key", permissions: ["workflows:read", "agents:read"] },
    );

    expect(status).toBe(201);
    expect(data.raw).toMatch(/^ck_/);
    expect(data.prefix).toBeTruthy();
    createdKeyId = data.id;
    rawApiKey    = data.raw;
  });

  it("POST /v1/api-keys — response includes raw key only once", async () => {
    // Second call should return a different key (no way to retrieve raw)
    const { data: key2 } = await apiWithJWT<{ raw: string; id: string }>(
      "POST", "/v1/api-keys",
      { name: "Second Key" },
    );
    expect(key2.raw).not.toBe(rawApiKey);
    // Clean up
    await apiWithJWT("DELETE", `/v1/api-keys/${key2.id}`);
  });

  it("GET /v1/api-keys — lists keys without revealing raw", async () => {
    const { status, data } = await apiWithJWT<{ items?: { id: string; raw?: string }[] } | { id: string; raw?: string }[]>(
      "GET", "/v1/api-keys",
    );
    expect(status).toBe(200);
    const items = Array.isArray(data) ? data : (data.items ?? []);
    const match = items.find((k) => k.id === createdKeyId);
    expect(match).toBeTruthy();
    expect(match?.raw).toBeUndefined(); // never expose raw on list
  });

  it("API key authenticates successfully against protected route", async () => {
    const { status } = await apiWithKey(
      "GET", "/v1/workflows", rawApiKey,
    );
    // Should authenticate; may get 200 with empty list or filtered results
    expect([200]).toContain(status);
  });

  it("Tampered API key is rejected", async () => {
    const tampered = rawApiKey.slice(0, -4) + "XXXX";
    const { status } = await apiWithKey("GET", "/v1/workflows", tampered);
    expect(status).toBe(401);
  });

  it("DELETE /v1/api-keys/:id — revokes key", async () => {
    const { status } = await apiWithJWT("DELETE", `/v1/api-keys/${createdKeyId}`);
    expect(status).toBe(204);
  });

  it("Revoked key is rejected", async () => {
    const { status } = await apiWithKey("GET", "/v1/workflows", rawApiKey);
    expect(status).toBe(401);
  });
});
