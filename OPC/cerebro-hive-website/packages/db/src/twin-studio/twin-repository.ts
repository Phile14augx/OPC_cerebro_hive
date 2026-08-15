import type {
  ApplyVersionProposalCommand,
  CreateScenarioCommand,
  CreateTwinCommand,
  CreateVersionProposalCommand,
  RejectVersionProposalCommand,
  Scope,
  UpdateEntityStateCommand,
} from '@cerebro/twin-contracts';
import { TwinDefinitionSchema } from '@cerebro/twin-contracts';
import { buildTwinGraph, evaluateScenario, evaluateTwinRules } from '@cerebro/twin-domain';
import { Prisma, PrismaClient } from '../generated/client';

const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const nullable = <T>(value: T | undefined): T | null => value ?? null;

const scopeWhere = (scope: Scope) => ({
  tenantId: scope.tenantId,
  workspaceId: scope.workspaceId,
});

const twinInclude = {
  activeVersion: true,
  versions: { orderBy: { versionNumber: 'desc' as const } },
  entities: { include: { currentState: true }, orderBy: { key: 'asc' as const } },
};

export class TwinRepository {
  constructor(private readonly db: PrismaClient) {}

  list(
    scope: Scope,
    options: { q?: string; type?: string; take?: number; skip?: number } = {},
  ) {
    const take = Math.min(Math.max(options.take ?? 50, 1), 200);
    const skip = Math.max(options.skip ?? 0, 0);
    return this.db.digitalTwin.findMany({
      where: {
        ...scopeWhere(scope),
        archivedAt: null,
        ...(options.type ? { type: options.type } : {}),
        ...(options.q ? { name: { contains: options.q, mode: 'insensitive' } } : {}),
      },
      include: twinInclude,
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    });
  }

  getById(scope: Scope, id: string) {
    return this.db.digitalTwin.findFirst({
      where: { id, ...scopeWhere(scope), archivedAt: null },
      include: twinInclude,
    });
  }

  async create(command: CreateTwinCommand) {
    return this.db.$transaction(async (tx) => {
      const twin = await tx.digitalTwin.create({
        data: {
          tenantId: command.tenantId,
          workspaceId: command.workspaceId,
          name: command.name,
          type: command.type,
          metadata: json(command.metadata),
          createdBy: nullable(command.createdBy),
          updatedBy: nullable(command.createdBy),
        },
      });
      const version = await tx.twinVersion.create({
        data: {
          twinId: twin.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          definition: json(command.definition),
          createdBy: nullable(command.createdBy),
          publishedAt: new Date(),
        },
      });
      if (command.definition.entities.length > 0) {
        await tx.twinEntity.createMany({
          data: command.definition.entities.map((entity) => ({
            twinId: twin.id,
            versionId: version.id,
            key: entity.key,
            name: entity.name,
            typeKey: entity.typeKey,
            attributes: json(entity.attributes),
          })),
        });
      }
      await tx.digitalTwin.update({
        where: { id: twin.id },
        data: { status: 'LIVE', activeVersionId: version.id },
      });
      const created = await tx.digitalTwin.findUnique({
        where: { id: twin.id },
        include: twinInclude,
      });
      if (!created) throw new Error('TWIN_CREATE_FAILED');
      return created;
    });
  }

  async update(
    scope: Scope,
    id: string,
    input: { name?: string; metadata?: Record<string, unknown>; updatedBy?: string },
  ) {
    const twin = await this.getById(scope, id);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    await this.db.digitalTwin.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.metadata ? { metadata: json(input.metadata) } : {}),
        ...(input.updatedBy ? { updatedBy: input.updatedBy } : {}),
      },
    });
    return this.getById(scope, id);
  }

  async archive(scope: Scope, id: string, updatedBy?: string) {
    const result = await this.db.digitalTwin.updateMany({
      where: { id, ...scopeWhere(scope), archivedAt: null },
      data: { status: 'ARCHIVED', archivedAt: new Date(), updatedBy: nullable(updatedBy) },
    });
    if (result.count !== 1) throw new Error('TWIN_NOT_FOUND');
  }

  async appendState(command: UpdateEntityStateCommand) {
    const result = await this.db.$transaction(
      async (tx) => {
        const twin = await tx.digitalTwin.findFirst({
          where: {
            id: command.twinId,
            ...scopeWhere(command),
            archivedAt: null,
            activeVersionId: { not: null },
          },
          select: { activeVersionId: true },
        });
        if (!twin?.activeVersionId) throw new Error('TWIN_NOT_FOUND');
        const entity = await tx.twinEntity.findFirst({
          where: { id: command.entityId, twinId: command.twinId },
          select: { id: true },
        });
        if (!entity) throw new Error('ENTITY_NOT_FOUND');

        const provenance = json(command.provenance);
        const history = await tx.twinEntityState.create({
          data: {
            tenantId: command.tenantId,
            workspaceId: command.workspaceId,
            twinId: command.twinId,
            entityId: command.entityId,
            versionId: twin.activeVersionId,
            state: json(command.state),
            provenance,
            source: command.provenance.source,
            classification: command.provenance.classification,
            confidence: nullable(command.provenance.confidence),
            observedAt: command.provenance.observedAt,
            effectiveAt: command.provenance.effectiveAt,
            ingestedAt: command.provenance.ingestedAt,
          },
        });
        const current = await tx.twinEntityCurrentState.findUnique({
          where: { entityId: command.entityId },
          select: { effectiveAt: true, ingestedAt: true },
        });
        const isNewest =
          !current ||
          command.provenance.effectiveAt > current.effectiveAt ||
          (command.provenance.effectiveAt.getTime() === current.effectiveAt.getTime() &&
            command.provenance.ingestedAt >= current.ingestedAt);
        if (isNewest) {
          await tx.twinEntityCurrentState.upsert({
            where: { entityId: command.entityId },
            create: {
              tenantId: command.tenantId,
              workspaceId: command.workspaceId,
              twinId: command.twinId,
              entityId: command.entityId,
              versionId: twin.activeVersionId,
              state: json(command.state),
              provenance,
              source: command.provenance.source,
              classification: command.provenance.classification,
              confidence: nullable(command.provenance.confidence),
              observedAt: command.provenance.observedAt,
              effectiveAt: command.provenance.effectiveAt,
              ingestedAt: command.provenance.ingestedAt,
            },
            update: {
              versionId: twin.activeVersionId,
              state: json(command.state),
              provenance,
              source: command.provenance.source,
              classification: command.provenance.classification,
              confidence: nullable(command.provenance.confidence),
              observedAt: command.provenance.observedAt,
              effectiveAt: command.provenance.effectiveAt,
              ingestedAt: command.provenance.ingestedAt,
            },
          });
        }
        return { history, projected: isNewest };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    if (result.projected) {
      await this.syncRuleEvents(command, command.twinId);
    }
    return result;
  }

  async listEvents(scope: Scope, twinId: string, take = 200) {
    const twin = await this.getById(scope, twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    const events = await this.db.twinEvent.findMany({
      where: { ...scopeWhere(scope), twinId },
      include: { entity: { select: { id: true, key: true, name: true, typeKey: true } } },
      orderBy: { openedAt: 'desc' },
      take: Math.min(Math.max(take, 1), 500),
    });
    return events.sort((left, right) => {
      if (left.status !== right.status) return left.status === 'OPEN' ? -1 : 1;
      return right.openedAt.getTime() - left.openedAt.getTime();
    });
  }

  async getGraph(scope: Scope, twinId: string) {
    const twin = await this.getById(scope, twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    const definition = TwinDefinitionSchema.safeParse(twin.activeVersion?.definition);
    return buildTwinGraph({
      relationshipTypes: definition.success ? definition.data.relationshipTypes : [],
      entities: twin.entities.map((entity) => ({
        id: entity.id,
        key: entity.key,
        name: entity.name,
        typeKey: entity.typeKey,
        attributes: asRecord(entity.attributes),
      })),
    });
  }

  async syncRuleEvents(scope: Scope, twinId: string) {
    const twin = await this.getById(scope, twinId);
    if (!twin?.activeVersionId) throw new Error('TWIN_NOT_FOUND');
    const definition = TwinDefinitionSchema.safeParse(twin.activeVersion?.definition);
    const rules = definition.success ? definition.data.rules : [];
    if (rules.length === 0) return { opened: 0, cleared: 0 };
    const now = new Date();
    let opened = 0;
    let cleared = 0;
    await this.db.$transaction(async (tx) => {
      for (const entity of twin.entities) {
        if (!entity.currentState) continue;
        const current = entity.currentState;
        const state = asRecord(current.state);
        const evaluations = evaluateTwinRules(rules, state);
        for (const evaluation of evaluations) {
          if (evaluation.parseError) continue;
          const open = await tx.twinEvent.findFirst({
            where: {
              ...scopeWhere(scope),
              twinId,
              entityId: entity.id,
              ruleKey: evaluation.key,
              status: 'OPEN',
            },
          });
          if (evaluation.fired) {
            if (open) continue;
            try {
              await tx.twinEvent.create({
                data: {
                  tenantId: scope.tenantId,
                  workspaceId: scope.workspaceId,
                  twinId,
                  entityId: entity.id,
                  versionId: twin.activeVersionId!,
                  ruleKey: evaluation.key,
                  kind: 'RULE_FIRED',
                  status: 'OPEN',
                  message: `Rule ${evaluation.key} fired: ${evaluation.expression}`,
                  state: json(state),
                  provenance: json({
                    source: 'twin-rule-engine',
                    classification: current.classification,
                    observedAt: current.observedAt,
                    effectiveAt: current.effectiveAt,
                    ingestedAt: now,
                    evidenceIds: [current.id],
                    ruleKey: evaluation.key,
                    expression: evaluation.expression,
                  }),
                  source: 'twin-rule-engine',
                  classification: current.classification,
                  openedAt: now,
                },
              });
              opened += 1;
            } catch (error) {
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                continue;
              }
              throw error;
            }
          } else if (open) {
            await tx.twinEvent.update({
              where: { id: open.id },
              data: { status: 'CLEARED', clearedAt: now },
            });
            cleared += 1;
          }
        }
      }
    });
    return { opened, cleared };
  }

  async listStateHistory(scope: Scope, twinId: string, entityId: string, take = 100) {
    const twin = await this.getById(scope, twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    if (!twin.entities.some((entity) => entity.id === entityId)) {
      throw new Error('ENTITY_NOT_FOUND');
    }
    return this.db.twinEntityState.findMany({
      where: { ...scopeWhere(scope), twinId, entityId },
      orderBy: [{ effectiveAt: 'desc' }, { ingestedAt: 'desc' }],
      take: Math.min(Math.max(take, 1), 500),
    });
  }

  async createProposal(command: CreateVersionProposalCommand) {
    const twin = await this.getById(command, command.twinId);
    if (!twin) throw new Error('TWIN_NOT_FOUND');
    TwinDefinitionSchema.parse(command.definition);
    return this.db.twinVersionProposal.create({
      data: {
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        twinId: command.twinId,
        status: 'PREVIEW',
        definition: json(command.definition),
        provenance: json(command.provenance),
        schemaValid: true,
        policyValid: true,
        createdBy: nullable(command.createdBy),
      },
    });
  }

  async rejectProposal(command: RejectVersionProposalCommand) {
    const result = await this.db.twinVersionProposal.updateMany({
      where: {
        id: command.proposalId,
        twinId: command.twinId,
        ...scopeWhere(command),
        status: 'PREVIEW',
      },
      data: {
        status: 'REJECTED',
        rejectionReason: nullable(command.reason),
        rejectedAt: new Date(),
      },
    });
    if (result.count !== 1) throw new Error('PROPOSAL_NOT_FOUND_OR_ALREADY_APPLIED');
    return this.db.twinVersionProposal.findFirst({
      where: { id: command.proposalId, twinId: command.twinId, ...scopeWhere(command) },
    });
  }

  listProposals(scope: Scope, twinId: string) {
    return this.db.twinVersionProposal.findMany({
      where: { ...scopeWhere(scope), twinId },
      orderBy: { createdAt: 'desc' },
    });
  }

  listVersions(scope: Scope, twinId: string) {
    return this.db.twinVersion.findMany({
      where: { twin: { id: twinId, ...scopeWhere(scope), archivedAt: null } },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async applyProposal(command: ApplyVersionProposalCommand) {
    const apply = () =>
      this.db.$transaction(
        async (tx) => {
          const twin = await tx.digitalTwin.findFirst({
            where: { id: command.twinId, ...scopeWhere(command), archivedAt: null },
            select: { id: true },
          });
          if (!twin) throw new Error('TWIN_NOT_FOUND');
          const proposal = await tx.twinVersionProposal.findFirst({
            where: {
              id: command.proposalId,
              twinId: command.twinId,
              ...scopeWhere(command),
              status: 'PREVIEW',
              schemaValid: true,
              policyValid: true,
            },
          });
          if (!proposal) throw new Error('PROPOSAL_NOT_FOUND_OR_ALREADY_APPLIED');
          TwinDefinitionSchema.parse(proposal.definition);
          const claimed = await tx.twinVersionProposal.updateMany({
            where: { id: proposal.id, status: 'PREVIEW' },
            data: { status: 'APPLYING' },
          });
          if (claimed.count !== 1) throw new Error('PROPOSAL_ALREADY_APPLIED');
          const latest = await tx.twinVersion.aggregate({
            where: { twinId: command.twinId },
            _max: { versionNumber: true },
          });
          const definition = proposal.definition as {
            entities?: Array<{
              key: string;
              name: string;
              typeKey: string;
              attributes?: Record<string, unknown>;
            }>;
          };
          const version = await tx.twinVersion.create({
            data: {
              twinId: command.twinId,
              versionNumber: (latest._max.versionNumber ?? 0) + 1,
              status: 'PUBLISHED',
              definition: proposal.definition as Prisma.InputJsonValue,
              sourceProposalId: proposal.id,
              createdBy: nullable(command.appliedBy),
              publishedAt: new Date(),
            },
          });
          await tx.twinVersion.updateMany({
            where: { twinId: command.twinId, id: { not: version.id }, status: 'PUBLISHED' },
            data: { status: 'ARCHIVED', archivedAt: new Date() },
          });
          for (const entity of definition.entities ?? []) {
            await tx.twinEntity.upsert({
              where: { twinId_key: { twinId: command.twinId, key: entity.key } },
              create: {
                twinId: command.twinId,
                versionId: version.id,
                key: entity.key,
                name: entity.name,
                typeKey: entity.typeKey,
                attributes: json(entity.attributes ?? {}),
              },
              update: {
                versionId: version.id,
                name: entity.name,
                typeKey: entity.typeKey,
                attributes: json(entity.attributes ?? {}),
              },
            });
          }
          await tx.digitalTwin.update({
            where: { id: command.twinId },
            data: {
              activeVersionId: version.id,
              status: 'LIVE',
              updatedBy: nullable(command.appliedBy),
            },
          });
          await tx.twinVersionProposal.update({
            where: { id: proposal.id },
            data: { status: 'APPLIED', appliedAt: new Date(), appliedVersionId: version.id },
          });
          return version;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await apply();
      } catch (error) {
        if (
          attempt < 2 &&
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034'
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new Error('VERSION_APPLY_RETRY_EXHAUSTED');
  }

  async createScenario(command: CreateScenarioCommand) {
    const twin = await this.getById(command, command.twinId);
    if (!twin?.activeVersionId) throw new Error('TWIN_NOT_FOUND');
    return this.db.twinScenario.create({
      data: {
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        twinId: command.twinId,
        versionId: twin.activeVersionId,
        name: command.name,
        kind: command.kind,
        inputs: json(command.inputs),
        createdBy: nullable(command.createdBy),
      },
    });
  }

  listScenarios(scope: Scope, twinId: string) {
    return this.db.twinScenario.findMany({
      where: { ...scopeWhere(scope), twinId },
      include: { runs: { orderBy: { startedAt: 'desc' }, take: 20 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async runScenario(scope: Scope, twinId: string, scenarioId: string) {
    return this.db.$transaction(async (tx) => {
      const scenario = await tx.twinScenario.findFirst({
        where: { id: scenarioId, twinId, ...scopeWhere(scope) },
      });
      if (!scenario) throw new Error('SCENARIO_NOT_FOUND');
      const current = await tx.twinEntityCurrentState.findMany({
        where: { twinId, ...scopeWhere(scope) },
        orderBy: { entityId: 'asc' },
      });
      const entities = await tx.twinEntity.findMany({
        where: { twinId },
        select: { id: true, key: true, name: true },
      });
      const entityById = new Map(entities.map((entity) => [entity.id, entity]));
      const now = new Date();
      const inputs = scenario.inputs as Record<string, unknown>;
      const kind = scenario.kind === 'CAPACITY_CHANGE' ? 'CAPACITY_CHANGE' : 'ENTITY_OUTAGE';
      const evaluation = evaluateScenario(
        kind,
        inputs,
        current.map((item) => {
          const entity = entityById.get(item.entityId);
          return {
            entityId: item.entityId,
            state: item.state as Record<string, unknown>,
            ...(entity?.key ? { entityKey: entity.key } : {}),
            ...(entity?.name ? { entityName: entity.name } : {}),
          };
        }),
      );
      return tx.twinSimulationRun.create({
        data: {
          tenantId: scope.tenantId,
          workspaceId: scope.workspaceId,
          twinId,
          versionId: scenario.versionId,
          scenarioId,
          status: 'COMPLETED',
          snapshot: json(evaluation.snapshot),
          result: json(evaluation.result),
          provenance: json({
            source: 'deterministic-scenario-engine',
            classification: 'SIMULATED',
            observedAt: now,
            effectiveAt: now,
            ingestedAt: now,
            evidenceIds: current.map((state) => state.id),
          }),
          completedAt: now,
        },
      });
    });
  }
}
