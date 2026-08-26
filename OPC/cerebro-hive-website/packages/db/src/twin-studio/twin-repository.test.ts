import assert from "node:assert/strict";
import { test } from "vitest";
import { TwinRepository, type TwinPersistenceClient } from "./twin-repository";

const scope = { tenantId: "tenant-a", workspaceId: "workspace-a" };
const model = {
  id: "industry-proposal-1",
  domain: "Airport",
  status: "PREVIEW" as const,
  definition: {
    entityTypes: [{ key: "runway", name: "Runway", attributes: [] }],
    relationshipTypes: [],
    variables: [],
    rules: [],
  },
  suggestedEntities: [{ typeKey: "runway", name: "Runway", count: 1 }],
  alerts: [],
  provenance: {
    source: "test",
    classification: "INFERRED" as const,
    observedAt: new Date("2026-08-11T00:00:00Z"),
    effectiveAt: new Date("2026-08-11T00:00:00Z"),
    ingestedAt: new Date("2026-08-11T00:00:00Z"),
    evidenceIds: [],
  },
  warnings: [],
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

function fakeClient() {
  const events: string[] = [];
  const state = {
    twin: {
      id: "twin-a",
      ...scope,
      name: "Airport Twin",
      status: "LIVE",
      activeVersionId: "version-1",
    },
    proposals: [] as Array<Record<string, unknown>>,
    versions: [
      {
        id: "version-1",
        twinId: "twin-a",
        versionNumber: 1,
        status: "PUBLISHED",
        definition: { entityTypes: [] },
        sourceProposalId: null,
        createdAt: new Date(),
      },
    ] as Array<Record<string, unknown>>,
  };

  const client = {
    digitalTwin: {
      async findFirst(args: any) {
        const where = args.where;
        return state.twin.id === where.id &&
          state.twin.tenantId === where.tenantId &&
          state.twin.workspaceId === where.workspaceId
          ? clone(state.twin)
          : null;
      },
      async create() {
        throw new Error("not used");
      },
      async update(args: any) {
        events.push(args.data.activeVersionId ? "activate-twin" : "lock-twin");
        Object.assign(state.twin, args.data);
        return clone(state.twin);
      },
    },
    twinVersionProposal: {
      async create(args: any) {
        const record = {
          id: `proposal-${state.proposals.length + 1}`,
          status: "PREVIEW",
          createdAt: new Date(),
          appliedAt: null,
          appliedVersion: null,
          ...clone(args.data),
        };
        state.proposals.push(record);
        return clone(record);
      },
      async findFirst(args: any) {
        events.push("read-proposal");
        const record = state.proposals.find(
          (item) =>
            item.id === args.where.id &&
            item.twinId === args.where.twinId &&
            item.tenantId === args.where.tenantId &&
            item.workspaceId === args.where.workspaceId,
        );
        if (!record) return null;
        const appliedVersion =
          state.versions.find((item) => item.sourceProposalId === record.id) ?? null;
        return clone({ ...record, appliedVersion });
      },
      async update(args: any) {
        const record = state.proposals.find((item) => item.id === args.where.id)!;
        Object.assign(record, args.data);
        return clone(record);
      },
    },
    twinVersion: {
      async findFirst(args: any) {
        const matches = state.versions.filter((item) => item.twinId === args.where.twinId);
        return clone(
          matches.sort((a, b) => Number(b.versionNumber) - Number(a.versionNumber))[0] ?? null,
        );
      },
      async findMany(args: any) {
        return clone(state.versions.filter((item) => item.twinId === args.where.twinId));
      },
      async create(args: any) {
        const record = {
          id: `version-${state.versions.length + 1}`,
          createdAt: new Date(),
          ...clone(args.data),
        };
        state.versions.push(record);
        return clone(record);
      },
      async updateMany(args: any) {
        let count = 0;
        for (const item of state.versions) {
          if (
            item.twinId === args.where.twinId &&
            (!args.where.status || item.status === args.where.status)
          ) {
            Object.assign(item, args.data);
            count++;
          }
        }
        return { count };
      },
    },
    async $transaction<T>(fn: (tx: unknown) => Promise<T>) {
      return fn(client);
    },
  };

  return { state, events, client: client as unknown as TwinPersistenceClient };
}

test("preview persistence does not create or activate a twin version", async () => {
  const { state, client } = fakeClient();
  const repository = new TwinRepository(client);

  const proposal = await repository.createVersionProposal(scope, "twin-a", model);

  assert.equal(proposal.status, "PREVIEW");
  assert.equal(state.versions.length, 1);
  assert.equal(state.twin.activeVersionId, "version-1");
});

test("approval persists one version and activates it transactionally across repository recreation", async () => {
  const { state, events, client } = fakeClient();
  const proposal = await new TwinRepository(client).createVersionProposal(scope, "twin-a", model);

  const first = await new TwinRepository(client).applyVersionProposal(scope, "twin-a", proposal.id);
  const second = await new TwinRepository(client).applyVersionProposal(
    scope,
    "twin-a",
    proposal.id,
  );

  assert.equal(first.id, second.id);
  assert.equal(state.versions.length, 2);
  assert.equal(state.twin.activeVersionId, first.id);
  assert.equal(state.versions.find((item) => item.id === "version-1")?.status, "ARCHIVED");
  assert.equal((await new TwinRepository(client).listTwinVersions(scope, "twin-a")).length, 2);
  assert.ok(
    events.indexOf("lock-twin") < events.indexOf("read-proposal"),
    "the twin row is locked before proposal/version reads",
  );
});

test("approval is bound to tenant, workspace, and route twin", async () => {
  const { client } = fakeClient();
  const repository = new TwinRepository(client);
  const proposal = await repository.createVersionProposal(scope, "twin-a", model);

  await assert.rejects(
    () => repository.applyVersionProposal(scope, "twin-b", proposal.id),
    /TWIN_NOT_FOUND|PROPOSAL_TWIN_MISMATCH/,
  );
  await assert.rejects(
    () =>
      repository.applyVersionProposal(
        { ...scope, workspaceId: "workspace-b" },
        "twin-a",
        proposal.id,
      ),
    /TWIN_NOT_FOUND/,
  );
});
