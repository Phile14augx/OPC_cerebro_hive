import { createInitialAgentDraft, hashAgentDefinition, type AgentDefinitionV1, type AgentLifecycleStatus } from '@cerebro/agent-registry-contracts';
import { Prisma, type PrismaClient } from '../generated/client';
import { classifyLegacyAgent } from './migration-classifier';

export interface LegacyVersionBackfillRecord {
  id: string;
  version: number;
  modelId?: string;
  instructions?: string;
  config?: unknown;
  definition?: unknown;
  definitionHash?: string | null;
  createdAt?: Date;
}

export interface LegacyAgentBackfillRecord {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  activeVersionId: string | null;
  lifecycleStatus: AgentLifecycleStatus | null;
  versions: LegacyVersionBackfillRecord[];
}

export interface AgentBackfillPlan {
  agentId: string;
  workspaceId: string;
  activeVersionId: string | null;
  lifecycleStatus: AgentLifecycleStatus;
  reviewRequired: boolean;
  selectedVersion: LegacyVersionBackfillRecord | null;
  name: string;
  description: string | null;
}

export interface AgentRegistryBackfillStore {
  listAgentsAfter(cursor: string | null, limit: number): Promise<LegacyAgentBackfillRecord[]>;
  applyAgent(plan: AgentBackfillPlan): Promise<boolean>;
}

export interface BackfillManifest {
  mode: 'dry-run' | 'apply';
  scanned: number;
  changed: number;
  unchanged: number;
  batches: number;
  lastCursor: string | null;
  reviewRequired: string[];
}

export async function runBackfill(
  store: AgentRegistryBackfillStore,
  options: { mode: 'dry-run' | 'apply'; batchSize?: number; after?: string | null },
): Promise<BackfillManifest> {
  const batchSize = Math.max(1, Math.min(options.batchSize ?? 100, 1_000));
  let cursor = options.after ?? null;
  const manifest: BackfillManifest = { mode: options.mode, scanned: 0, changed: 0, unchanged: 0, batches: 0, lastCursor: cursor, reviewRequired: [] };

  while (true) {
    const agents = await store.listAgentsAfter(cursor, batchSize);
    if (!agents.length) break;
    manifest.batches += 1;
    for (const agent of agents) {
      const selectedVersion = [...agent.versions].sort((left, right) => right.version - left.version)[0] ?? null;
      const classification = classifyLegacyAgent({ isActive: agent.isActive, selectedVersionId: selectedVersion?.id ?? null });
      const plan: AgentBackfillPlan = {
        agentId: agent.id,
        workspaceId: agent.workspaceId,
        activeVersionId: selectedVersion?.id ?? null,
        lifecycleStatus: classification.lifecycle,
        reviewRequired: classification.reviewRequired,
        selectedVersion,
        name: agent.name,
        description: agent.description,
      };
      const needsChange = agent.activeVersionId !== plan.activeVersionId || agent.lifecycleStatus !== plan.lifecycleStatus;
      const changed = options.mode === 'apply' ? await store.applyAgent(plan) : needsChange;
      if (changed) manifest.changed += 1; else manifest.unchanged += 1;
      if (plan.reviewRequired) manifest.reviewRequired.push(agent.id);
      manifest.scanned += 1;
      cursor = agent.id;
      manifest.lastCursor = cursor;
    }
    if (agents.length < batchSize) break;
  }
  return manifest;
}

function legacyDefinition(plan: AgentBackfillPlan): AgentDefinitionV1 {
  const version = plan.selectedVersion;
  return {
    schemaVersion: 1,
    purpose: plan.description?.trim() || `Operate as ${plan.name}`,
    businessFunction: 'Legacy imported agent',
    responsibilities: ['Preserve the behavior of the existing runtime agent'],
    expectedOutputs: ['A response compatible with the existing runtime contract'],
    systemInstructions: version?.instructions?.trim() || 'Follow the existing runtime configuration.',
    modelConfig: {
      providerRef: 'provider:legacy',
      modelRef: `model:${version?.modelId ?? 'unresolved'}`,
      temperature: typeof (version?.config as any)?.temperature === 'number' ? (version?.config as any).temperature : 0.2,
      maxTokens: typeof (version?.config as any)?.maxTokens === 'number' ? (version?.config as any).maxTokens : 4096,
    },
    capabilities: [], allowedActions: [], prohibitedActions: [], escalationRules: [],
    securityLevel: 'INTERNAL', toolPermissions: [], knowledgeSources: [],
  };
}

export class PrismaAgentRegistryBackfillStore implements AgentRegistryBackfillStore {
  constructor(private readonly prisma: PrismaClient) {}

  async listAgentsAfter(cursor: string | null, limit: number): Promise<LegacyAgentBackfillRecord[]> {
    return this.prisma.agent.findMany({
      where: cursor ? { id: { gt: cursor } } : undefined,
      orderBy: { id: 'asc' },
      take: limit,
      select: {
        id: true, workspaceId: true, name: true, description: true, isActive: true, activeVersionId: true, lifecycleStatus: true,
        versions: { orderBy: { version: 'desc' }, select: { id: true, version: true, modelId: true, instructions: true, config: true, definition: true, definitionHash: true, createdAt: true } },
      },
    }) as Promise<LegacyAgentBackfillRecord[]>;
  }

  async applyAgent(plan: AgentBackfillPlan): Promise<boolean> {
    return this.prisma.$transaction(async tx => {
      const current = await tx.agent.findUniqueOrThrow({ where: { id: plan.agentId }, select: { activeVersionId: true, lifecycleStatus: true } });
      const definition = plan.selectedVersion
        ? ((plan.selectedVersion.definition as AgentDefinitionV1 | undefined) ?? legacyDefinition(plan))
        : createInitialAgentDraft();

      if (plan.selectedVersion) {
        const snapshot = definition as AgentDefinitionV1;
        await tx.agentVersion.update({
          where: { id: plan.selectedVersion.id },
          data: {
            workspaceId: plan.workspaceId,
            definition: snapshot as Prisma.InputJsonValue,
            definitionSchemaVersion: 1,
            definitionHash: plan.selectedVersion.definitionHash ?? hashAgentDefinition(snapshot),
            publishedAt: plan.selectedVersion.createdAt ?? new Date(),
            publicationSource: 'MIGRATION',
          },
        });
      }
      await tx.agent.update({
        where: { id: plan.agentId },
        data: { activeVersionId: plan.activeVersionId, lifecycleStatus: plan.lifecycleStatus },
      });
      await tx.agentDraft.upsert({
        where: { agentId: plan.agentId },
        create: {
          agentId: plan.agentId, workspaceId: plan.workspaceId, baseVersionId: plan.activeVersionId,
          definition: definition as Prisma.InputJsonValue, revision: 1,
          validationStatus: plan.activeVersionId ? 'VALID' : 'UNVALIDATED',
        },
        update: {},
      });
      return current.activeVersionId !== plan.activeVersionId || current.lifecycleStatus !== plan.lifecycleStatus;
    });
  }
}
