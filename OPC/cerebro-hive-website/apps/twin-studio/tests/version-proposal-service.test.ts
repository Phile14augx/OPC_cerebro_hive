import assert from 'node:assert/strict';
import { test } from 'vitest';
import type { IndustryModelProposal, Scope, TwinDefinition } from '@cerebro/twin-contracts';
import { generateIndustryModel } from '../modules/industry/deterministic-industry-provider';
import {
  mapStoredTwinVersion,
  VersionProposalService,
  type AppliedTwinVersion,
  type StoredVersionProposal,
  type VersionProposalStore,
} from '../modules/twin-definition/version-proposal-service';

const scope: Scope = { tenantId: 'tenant-a', workspaceId: 'workspace-a' };

function clone<T>(value: T): T {
  return structuredClone(value);
}

class MemoryVersionStore implements VersionProposalStore {
  readonly proposals = new Map<string, StoredVersionProposal>();
  readonly versions = new Map<string, AppliedTwinVersion[]>();
  readonly activeVersionByTwin = new Map<string, string>();

  async createProposal(input: Omit<StoredVersionProposal, 'id' | 'status' | 'createdAt'>) {
    const proposal: StoredVersionProposal = {
      ...clone(input),
      id: `proposal-${this.proposals.size + 1}`,
      status: 'PREVIEW',
      createdAt: new Date(),
    };
    this.proposals.set(proposal.id, proposal);
    return clone(proposal);
  }

  async applyProposal(input: { scope: Scope; twinId: string; proposalId: string }) {
    const proposal = this.proposals.get(input.proposalId);
    if (!proposal || proposal.scope.tenantId !== input.scope.tenantId || proposal.scope.workspaceId !== input.scope.workspaceId) {
      throw new Error('PROPOSAL_NOT_FOUND');
    }
    if (proposal.twinId !== input.twinId) throw new Error('PROPOSAL_TWIN_MISMATCH');
    if (proposal.appliedVersionId) {
      const appliedVersion = this.versions
        .get(input.twinId)
        ?.find((item) => item.id === proposal.appliedVersionId);
      if (!appliedVersion) throw new Error('APPLIED_VERSION_NOT_FOUND');
      return clone(appliedVersion);
    }

    const current = this.versions.get(input.twinId) ?? [];
    const version: AppliedTwinVersion = {
      id: `version-${current.length + 1}`,
      twinId: input.twinId,
      versionNumber: current.length + 2,
      status: 'PUBLISHED',
      definition: clone(proposal.model.definition),
      sourceProposalId: proposal.id,
      createdAt: new Date(),
    };
    current.push(version);
    this.versions.set(input.twinId, current);
    this.activeVersionByTwin.set(input.twinId, version.id);
    proposal.status = 'APPLIED';
    proposal.appliedAt = new Date();
    proposal.appliedVersionId = version.id;
    return clone(version);
  }

  async listVersions(input: { scope: Scope; twinId: string }) {
    void input.scope;
    return clone(this.versions.get(input.twinId) ?? []);
  }
}

function airport(): IndustryModelProposal {
  return generateIndustryModel({ domain: 'Airport', description: 'International airport operations and infrastructure.' });
}

test('creating a preview proposal does not create or activate a twin version', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);

  const proposal = await service.createProposal(scope, 'twin-a', airport());

  assert.equal(proposal.status, 'PREVIEW');
  assert.deepEqual(await service.listVersions(scope, 'twin-a'), []);
  assert.equal(store.activeVersionByTwin.has('twin-a'), false);
});

test('approval creates exactly one version and activates it idempotently', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);
  const proposal = await service.createProposal(scope, 'twin-a', airport());

  const first = await service.applyProposal(scope, 'twin-a', proposal.id, true);
  const second = await service.applyProposal(scope, 'twin-a', proposal.id, true);

  assert.equal(first.id, second.id);
  assert.equal((await service.listVersions(scope, 'twin-a')).length, 1);
  assert.equal(store.activeVersionByTwin.get('twin-a'), first.id);
});

test('persisted proposal and version state survives service recreation', async () => {
  const store = new MemoryVersionStore();
  const proposal = await new VersionProposalService(store).createProposal(scope, 'twin-a', airport());
  await new VersionProposalService(store).applyProposal(scope, 'twin-a', proposal.id, true);

  const versions = await new VersionProposalService(store).listVersions(scope, 'twin-a');

  assert.equal(versions.length, 1);
  assert.equal(versions[0].sourceProposalId, proposal.id);
});

test('approved version is an immutable snapshot of proposal input', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);
  const model = airport();
  const originalName = model.definition.entityTypes[0].name;
  const proposal = await service.createProposal(scope, 'twin-a', model);
  const applied = await service.applyProposal(scope, 'twin-a', proposal.id, true);

  model.definition.entityTypes[0].name = 'Caller mutation';
  applied.definition.entityTypes[0].name = 'Response mutation';
  const listed = await service.listVersions(scope, 'twin-a');

  assert.equal(listed[0].definition.entityTypes[0].name, originalName);
});

test('approval rejects a proposal belonging to another twin', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);
  const proposal = await service.createProposal(scope, 'twin-b', airport());

  await assert.rejects(() => service.applyProposal(scope, 'twin-a', proposal.id, true), /PROPOSAL_TWIN_MISMATCH/);
  assert.deepEqual(await service.listVersions(scope, 'twin-a'), []);
});

test('proposal creation rejects malformed industry models at runtime', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);

  await assert.rejects(
    () => service.createProposal(scope, 'twin-a', { status: 'PREVIEW', definition: undefined } as unknown as IndustryModelProposal),
    /Invalid input|expected/i,
  );
  assert.equal(store.proposals.size, 0);
});

test('approval requires an explicit true approval flag', async () => {
  const store = new MemoryVersionStore();
  const service = new VersionProposalService(store);
  const proposal = await service.createProposal(scope, 'twin-a', airport());

  await assert.rejects(() => service.applyProposal(scope, 'twin-a', proposal.id, false), /APPROVAL_REQUIRED/);
  assert.deepEqual(await service.listVersions(scope, 'twin-a'), []);
});

test('stored version mapping preserves archived status and omits absent proposal provenance', () => {
  const version = mapStoredTwinVersion({
    id: 'version-1',
    twinId: 'twin-a',
    versionNumber: 1,
    status: 'ARCHIVED',
    definition: airport().definition,
    sourceProposalId: null,
    createdAt: new Date('2026-08-11T00:00:00.000Z'),
  });

  assert.equal(version.status, 'ARCHIVED');
  assert.equal('sourceProposalId' in version, false);
});

// Compile-time assertion that applied definitions remain the canonical contract.
const _definitionContract: TwinDefinition | undefined = undefined;
void _definitionContract;
