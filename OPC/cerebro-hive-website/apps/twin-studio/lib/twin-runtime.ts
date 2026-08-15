import { prisma, TwinRepository } from '@cerebro/db/twin-studio';
import type { CreateTwinCommand, Scope } from '@cerebro/twin-contracts';
import { domainVocabulary } from '../modules/industry/domain-vocabulary';
import {
  DEV_TENANT_ID,
  DEV_USER_ID,
  DEV_WORKSPACE_ID,
} from './authenticated-request-context';

export const twinRepository = new TwinRepository(prisma);

const seedPacks: Array<{ name: string; type: string; definition: CreateTwinCommand['definition'] }> =
  [
    {
      name: 'Factory Alpha',
      type: domainVocabulary.manufacturing.type,
      definition: domainVocabulary.manufacturing.definition,
    },
    {
      name: 'Northstar Hospital ICU',
      type: domainVocabulary.hospital.type,
      definition: domainVocabulary.hospital.definition,
    },
  ];

let seedPromise: Promise<void> | undefined;

export function ensureDevelopmentTwinData() {
  if (process.env['NODE_ENV'] === 'production' || process.env['TWIN_STUDIO_DEV_AUTH'] === 'disabled') {
    return Promise.resolve();
  }
  seedPromise ??= seedDevelopmentTwinData().catch((error) => {
    seedPromise = undefined;
    throw error;
  });
  return seedPromise;
}

async function seedDevelopmentTwinData() {
  await prisma.tenant.upsert({
    where: { id: DEV_TENANT_ID },
    create: {
      id: DEV_TENANT_ID,
      name: 'Twin Studio Development',
      slug: 'twin-studio-development',
    },
    update: {},
  });
  await prisma.workspace.upsert({
    where: { id: DEV_WORKSPACE_ID },
    create: {
      id: DEV_WORKSPACE_ID,
      tenantId: DEV_TENANT_ID,
      name: 'Twin Studio Workspace',
      slug: 'twin-studio-workspace',
      isDefault: true,
    },
    update: { tenantId: DEV_TENANT_ID },
  });

  const scope: Scope = { tenantId: DEV_TENANT_ID, workspaceId: DEV_WORKSPACE_ID };
  const existing = await twinRepository.list(scope);
  for (const seed of seedPacks) {
    if (existing.some((twin) => twin.name === seed.name)) continue;
    const twin = await twinRepository.create({
      ...scope,
      ...seed,
      metadata: { seeded: true, phase: 'PHASE_2' },
      createdBy: DEV_USER_ID,
    });
    const now = new Date();
    for (const entity of twin.entities) {
      const state =
        seed.type === 'MANUFACTURING' && entity.key === 'motor-07'
          ? { temperature: 62, vibration: 2.4, productionRate: 94, alert: null }
          : seed.type === 'HEALTHCARE' && entity.key === 'icu-bed-12'
            ? { occupied: true, turnoverMinutes: 0, oxygenFlow: 3.5, alert: null }
            : { status: 'ACTIVE' };
      await twinRepository.appendState({
        ...scope,
        twinId: twin.id,
        entityId: entity.id,
        state,
        provenance: {
          source: 'twin-studio-development-seed',
          classification: 'SIMULATED',
          observedAt: now,
          effectiveAt: now,
          ingestedAt: now,
          confidence: 1,
          quality: 1,
          evidenceIds: [],
        },
      });
    }
  }
}
