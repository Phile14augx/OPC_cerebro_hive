import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TwinDefinitionSchema, type Scope } from '@cerebro/twin-contracts';

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

const { prisma, TwinRepository } = await import('@cerebro/db/twin-studio');

const tenantA = '00000000-0000-4000-8000-000000000201';
const workspaceA = '00000000-0000-4000-8000-000000000202';
const tenantB = '00000000-0000-4000-8000-000000000203';
const workspaceB = '00000000-0000-4000-8000-000000000204';

const factoryDefinition = TwinDefinitionSchema.parse({
  entityTypes: [
    { key: 'production-line', name: 'Production line' },
    { key: 'motor', name: 'Motor' },
  ],
  relationshipTypes: [{ key: 'installed-on', from: 'motor', to: 'production-line' }],
  variables: [
    { key: 'temperature', unit: '°C' },
    { key: 'vibration', unit: 'mm/s' },
  ],
  rules: [{ key: 'bearing-risk', expression: 'vibration > 6.5 && temperature > 76' }],
  entities: [
    { key: 'line-a', name: 'Production Line A', typeKey: 'production-line', attributes: {} },
    { key: 'motor-07', name: 'Motor-07', typeKey: 'motor', attributes: {} },
  ],
});

const hospitalDefinition = TwinDefinitionSchema.parse({
  entityTypes: [
    { key: 'icu-bed', name: 'ICU bed' },
    { key: 'patient-care-zone', name: 'Patient care zone' },
  ],
  relationshipTypes: [{ key: 'located-in', from: 'icu-bed', to: 'patient-care-zone' }],
  variables: [
    { key: 'occupancy', unit: 'boolean' },
    { key: 'turnover-minutes', unit: 'min' },
  ],
  rules: [{ key: 'turnover-delay', expression: 'turnover-minutes > 45' }],
  entities: [
    { key: 'icu-zone-east', name: 'ICU East', typeKey: 'patient-care-zone', attributes: {} },
    { key: 'icu-bed-12', name: 'ICU Bed 12', typeKey: 'icu-bed', attributes: {} },
  ],
});

function provenance(source = 'test') {
  const now = new Date();
  return {
    source,
    classification: 'SIMULATED' as const,
    observedAt: now,
    effectiveAt: now,
    ingestedAt: now,
    confidence: 1,
    quality: 1,
    evidenceIds: ['test'],
  };
}

describe('twin studio durable lifecycle', () => {
  const repository = new TwinRepository(prisma);
  const createdTwinIds: string[] = [];

  beforeAll(async () => {
    for (const tenant of [
      { id: tenantA, name: 'Twin A', slug: `twin-a-${randomUUID()}` },
      { id: tenantB, name: 'Twin B', slug: `twin-b-${randomUUID()}` },
    ]) {
      await prisma.tenant.upsert({
        where: { id: tenant.id },
        create: tenant,
        update: {},
      });
    }
    await prisma.workspace.upsert({
      where: { id: workspaceA },
      create: { id: workspaceA, tenantId: tenantA, name: 'Workspace A', slug: `ws-a-${randomUUID()}` },
      update: { tenantId: tenantA },
    });
    await prisma.workspace.upsert({
      where: { id: workspaceB },
      create: { id: workspaceB, tenantId: tenantB, name: 'Workspace B', slug: `ws-b-${randomUUID()}` },
      update: { tenantId: tenantB },
    });
  });

  afterAll(async () => {
    if (createdTwinIds.length > 0) {
      await prisma.digitalTwin.deleteMany({ where: { id: { in: createdTwinIds } } });
    }
    await prisma.$disconnect();
  });

  it('creates, reloads, mutates, and isolates twins through prisma', async () => {
    const scopeA: Scope = { tenantId: tenantA, workspaceId: workspaceA };
    const scopeB: Scope = { tenantId: tenantB, workspaceId: workspaceB };
    const factory = await repository.create({
      ...scopeA,
      name: `Factory ${randomUUID()}`,
      type: 'MANUFACTURING',
      metadata: {},
      definition: factoryDefinition,
      createdBy: 'tester',
    });
    const hospital = await repository.create({
      ...scopeA,
      name: `Hospital ${randomUUID()}`,
      type: 'HEALTHCARE',
      metadata: {},
      definition: hospitalDefinition,
      createdBy: 'tester',
    });
    createdTwinIds.push(factory.id, hospital.id);

    const reloaded = new TwinRepository(prisma);
    expect((await reloaded.getById(scopeA, factory.id))?.name).toBe(factory.name);
    expect((await reloaded.getById(scopeA, hospital.id))?.entities.some((entity) => entity.key === 'icu-bed-12')).toBe(true);
    expect(await reloaded.getById(scopeB, factory.id)).toBeNull();

    const motor = factory.entities.find((entity) => entity.key === 'motor-07');
    expect(motor).toBeTruthy();
    await repository.appendState({
      ...scopeA,
      twinId: factory.id,
      entityId: motor!.id,
      state: { temperature: 80, vibration: 7.4 },
      provenance: provenance(),
    });
    const history = await repository.listStateHistory(scopeA, factory.id, motor!.id);
    expect(history).toHaveLength(1);
    expect(await repository.listStateHistory(scopeB, factory.id, motor!.id).catch((error: Error) => error.message)).toBe(
      'TWIN_NOT_FOUND',
    );

    const proposal = await repository.createProposal({
      ...scopeA,
      twinId: factory.id,
      definition: factoryDefinition,
      provenance: provenance('twin-studio-ui'),
      createdBy: 'tester',
    });
    await expect(
      repository.applyProposal({
        ...scopeB,
        twinId: factory.id,
        proposalId: proposal.id,
        approved: true,
        appliedBy: 'intruder',
      }),
    ).rejects.toThrow();
    const published = await repository.applyProposal({
      ...scopeA,
      twinId: factory.id,
      proposalId: proposal.id,
      approved: true,
      appliedBy: 'tester',
    });
    expect(published.versionNumber).toBe(2);
    const afterApply = await repository.getById(scopeA, factory.id);
    expect(afterApply?.activeVersionId).toBe(published.id);
    expect(afterApply?.versions.filter((version) => version.status === 'PUBLISHED')).toHaveLength(1);
  });

  it('allocates unique version numbers under concurrent apply', async () => {
    const scopeA: Scope = { tenantId: tenantA, workspaceId: workspaceA };
    const twin = await repository.create({
      ...scopeA,
      name: `Concurrent ${randomUUID()}`,
      type: 'GENERIC',
      metadata: {},
      definition: factoryDefinition,
      createdBy: 'tester',
    });
    createdTwinIds.push(twin.id);
    const [first, second] = await Promise.all([
      repository.createProposal({
        ...scopeA,
        twinId: twin.id,
        definition: factoryDefinition,
        provenance: provenance('proposal-1'),
        createdBy: 'tester',
      }),
      repository.createProposal({
        ...scopeA,
        twinId: twin.id,
        definition: factoryDefinition,
        provenance: provenance('proposal-2'),
        createdBy: 'tester',
      }),
    ]);
    const results = await Promise.allSettled([
      repository.applyProposal({
        ...scopeA,
        twinId: twin.id,
        proposalId: first.id,
        approved: true,
        appliedBy: 'tester',
      }),
      repository.applyProposal({
        ...scopeA,
        twinId: twin.id,
        proposalId: second.id,
        approved: true,
        appliedBy: 'tester',
      }),
    ]);
    const versions = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value.versionNumber);
    expect(new Set(versions).size).toBe(versions.length);
    const stored = await prisma.twinVersion.findMany({ where: { twinId: twin.id } });
    const numbers = stored.map((version) => version.versionNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});
