import { describe, expect, it } from "vitest";

import type { PrismaTransactionClient } from "./BaseRepository";
import { OperatingSystemRepository } from "./OperatingSystemRepository";

const departments = [
  {
    id: "department-a",
    workspaceId: "workspace-a",
    name: "Engineering",
    slug: "engineering",
    description: "Builds the product",
    theme: "indigo",
    leaderAgentId: "agent-workspace-a",
    metadata: { privateNote: "department secret" },
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
  {
    id: "department-with-foreign-leader",
    workspaceId: "workspace-a",
    name: "Operations",
    slug: "operations",
    description: "Runs operations",
    theme: "amber",
    leaderAgentId: "agent-workspace-b",
    metadata: null,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
  {
    id: "department-workspace-b",
    workspaceId: "workspace-b",
    name: "Foreign Department",
    slug: "foreign-department",
    description: "Must never leak",
    theme: "red",
    leaderAgentId: "agent-workspace-b",
    metadata: null,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
];

const agents = [
  {
    id: "agent-workspace-a",
    workspaceId: "workspace-a",
    departmentId: "department-a",
    name: "Builder",
    description: "Builds approved work",
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [
      {
        version: 2,
        instructions: "system prompt secret",
        model: {
          id: "model-a",
          name: "Cerebro Model",
          provider: { id: "provider-a", name: "internal" },
        },
        tools: [
          {
            toolVersion: {
              tool: { id: "tool-a", name: "Deploy", description: "Deploy safely" },
              handlerCode: "handlerCode",
            },
          },
        ],
      },
    ],
  },
  {
    id: "agent-workspace-b",
    workspaceId: "workspace-b",
    departmentId: null,
    name: "Other tenant agent",
    description: "Must never leak",
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [],
  },
  {
    id: "agent-with-foreign-department",
    workspaceId: "workspace-a",
    departmentId: "department-workspace-b",
    name: "Foreign department reference",
    description: "Must redact the foreign department identifier",
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [],
  },
  {
    id: "agent-with-missing-department",
    workspaceId: "workspace-a",
    departmentId: "department-missing",
    name: "Missing department reference",
    description: "Must redact the dangling department identifier",
    avatarUrl: null,
    isActive: true,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [],
  },
];

const workflows = [
  {
    id: "workflow-a",
    workspaceId: "workspace-a",
    templateId: null,
    name: "Release",
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [{ version: 1 }],
  },
  {
    id: "agent-workspace-a",
    workspaceId: "workspace-a",
    templateId: null,
    name: "Same-id workflow",
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    versions: [{ version: 1 }],
  },
];

const relationships = [
  {
    id: "relationship-a",
    workspaceId: "workspace-a",
    sourceType: "agent",
    sourceId: "agent-workspace-a",
    targetType: "workflow",
    targetId: "workflow-a",
    relationship: "TRIGGERS",
    status: "healthy",
    metadata: { intensity: 0.8, credential: "relationship secret" },
    lastActivityAt: new Date("2026-08-09T00:00:00.000Z"),
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
  {
    id: "relationship-foreign-endpoint",
    workspaceId: "workspace-a",
    sourceType: "agent",
    sourceId: "agent-workspace-a",
    targetType: "agent",
    targetId: "agent-workspace-b",
    relationship: "COLLABORATES_WITH",
    status: "healthy",
    metadata: null,
    lastActivityAt: null,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
  {
    id: "relationship-dangling-endpoint",
    workspaceId: "workspace-a",
    sourceType: "agent",
    sourceId: "agent-workspace-a",
    targetType: "workflow",
    targetId: "workflow-missing",
    relationship: "TRIGGERS",
    status: "healthy",
    metadata: null,
    lastActivityAt: null,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
  {
    id: "relationship-same-id-workflow",
    workspaceId: "workspace-a",
    sourceType: "workflow",
    sourceId: "agent-workspace-a",
    targetType: "workflow",
    targetId: "workflow-a",
    relationship: "TRIGGERS",
    status: "healthy",
    metadata: null,
    lastActivityAt: null,
    createdAt: new Date("2026-08-09T00:00:00.000Z"),
    updatedAt: new Date("2026-08-09T00:00:00.000Z"),
  },
];

function fakeClient(): PrismaTransactionClient {
  const findMany = <T extends { workspaceId: string }>(rows: T[]) =>
    async ({ where }: { where: { workspaceId: string } }) =>
      rows.filter((row) => row.workspaceId === where.workspaceId);

  return {
    workspace: {
      findFirst: async ({ where }: { where: { id: string; tenantId: string } }) =>
        where.id === "workspace-a" && where.tenantId === "tenant-a"
          ? { id: "workspace-a" }
          : null,
    },
    operatingDepartment: { findMany: findMany(departments) },
    agent: { findMany: findMany(agents) },
    workflow: { findMany: findMany(workflows) },
    operatingGraphRelationship: { findMany: findMany(relationships) },
  } as unknown as PrismaTransactionClient;
}

function opts(workspaceId: string) {
  return {
    context: { tenantId: "tenant-a", workspaceId },
    tx: fakeClient(),
  };
}

describe("OperatingSystemRepository", () => {
  const repository = new OperatingSystemRepository({} as never);

  it("never returns an agent from another workspace", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
    expect(snapshot.nodes.some((node) => node.id === "agent-workspace-b")).toBe(false);
  });

  it("does not project instructions or tool handler code", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
    expect(JSON.stringify(snapshot)).not.toContain("system prompt secret");
    expect(JSON.stringify(snapshot)).not.toContain("handlerCode");
  });

  it("projects a model provider relation as its safe name", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
    const agent = snapshot.nodes.find((node) => node.id === "agent-workspace-a");

    expect(agent?.summary.provider).toBe("internal");
  });

  it("redacts department references outside the verified workspace", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
    const foreignReference = snapshot.nodes.find(
      (node) => node.id === "agent-with-foreign-department",
    );
    const missingReference = snapshot.nodes.find(
      (node) => node.id === "agent-with-missing-department",
    );

    expect(foreignReference?.departmentId).toBeNull();
    expect(missingReference?.departmentId).toBeNull();
  });

  it("redacts leader references outside the verified workspace", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));
    const department = snapshot.nodes.find(
      (node) => node.id === "department-with-foreign-leader",
    );

    expect(department?.summary.leaderAgentId).toBeNull();
  });

  it("omits relationships with foreign or dangling endpoints", async () => {
    const snapshot = await repository.getGraphSnapshot(opts("workspace-a"));

    expect(snapshot.edges.map(({ id }) => id)).not.toContain(
      "relationship-foreign-endpoint",
    );
    expect(snapshot.edges.map(({ id }) => id)).not.toContain(
      "relationship-dangling-endpoint",
    );
  });

  it("matches entity-detail relationships by endpoint type and id", async () => {
    const detail = await repository.getEntityDetail(
      "agent",
      "agent-workspace-a",
      opts("workspace-a"),
    );

    expect(detail?.relationships.map(({ id }) => id)).not.toContain(
      "relationship-same-id-workflow",
    );
  });

  it("rejects a workspace that is not owned by the request tenant", async () => {
    await expect(
      repository.getGraphSnapshot({
        context: { tenantId: "tenant-b", workspaceId: "workspace-a" },
        tx: fakeClient(),
      }),
    ).rejects.toThrow("Workspace not found or unauthorized");
  });

  it("returns only the selected entity and its safe relationships", async () => {
    const detail = await repository.getEntityDetail(
      "agent",
      "agent-workspace-a",
      opts("workspace-a"),
    );

    expect(detail?.node).toMatchObject({
      id: "agent-workspace-a",
      type: "agent",
      label: "Builder",
      departmentId: "department-a",
    });
    expect(detail?.relationships.map(({ id }) => id)).toEqual([
      "relationship-a",
    ]);
    expect(JSON.stringify(detail)).not.toContain("system prompt secret");
  });
});
