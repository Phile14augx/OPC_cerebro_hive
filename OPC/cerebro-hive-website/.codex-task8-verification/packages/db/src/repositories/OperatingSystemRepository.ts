import type {
  EntityDetail,
  OperatingEdge,
  OperatingGraphSnapshot,
  OperatingNode,
  OperatingNodeType,
  OperatingRelationship,
  OperatingStatus,
} from '../../../shared-types/src/domain/operating-system';

import { BaseRepository } from './BaseRepository';
import type { IRepositoryOptions } from './BaseRepository';

type DepartmentRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: string;
  leaderAgentId: string | null;
  updatedAt: Date;
};

type AgentRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  departmentId: string | null;
  updatedAt: Date;
  versions: Array<{
    version: number;
    model: { name: string; provider: { name: string } };
    tools: Array<{ toolVersion: { tool: { name: string } } }>;
  }>;
};

type WorkflowRow = {
  id: string;
  name: string;
  updatedAt: Date;
  versions: Array<{ version: number }>;
};

type RelationshipRow = {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationship: string;
  status: string;
  metadata: unknown;
  lastActivityAt: Date | null;
  updatedAt: Date;
};

type RelationshipEndpointTypes = {
  sourceType: OperatingNodeType;
  targetType: OperatingNodeType;
};

type ProjectedOperatingGraph = {
  snapshot: OperatingGraphSnapshot;
  endpointTypesByEdgeId: Map<string, RelationshipEndpointTypes>;
};

const NODE_TYPES = new Set<OperatingNodeType>([
  'department',
  'agent',
  'tool',
  'model',
  'skill',
  'data-source',
  'memory',
  'workflow',
  'task',
  'output',
  'human',
  'system',
  'integration',
]);

const RELATIONSHIPS = new Set<OperatingRelationship>([
  'REPORTS_TO',
  'COLLABORATES_WITH',
  'USES',
  'DELEGATES_TO',
  'READS_FROM',
  'WRITES_TO',
  'SHARES_MEMORY_WITH',
  'TRIGGERS',
  'DEPENDS_ON',
  'PRODUCES',
]);

const STATUSES = new Set<OperatingStatus>([
  'healthy',
  'idle',
  'running',
  'degraded',
  'failed',
  'offline',
]);

function safeStatus(value: string): OperatingStatus {
  return STATUSES.has(value as OperatingStatus)
    ? (value as OperatingStatus)
    : 'degraded';
}

function safeIntensity(metadata: unknown): number {
  if (
    typeof metadata === 'object' &&
    metadata !== null &&
    'intensity' in metadata &&
    typeof metadata.intensity === 'number' &&
    Number.isFinite(metadata.intensity)
  ) {
    return Math.min(1, Math.max(0, metadata.intensity));
  }
  return 1;
}

function detailUrl(type: OperatingNodeType, id: string): string {
  return `/operating-system/${type}/${encodeURIComponent(id)}`;
}

function nodeKey(type: OperatingNodeType, id: string): string {
  return JSON.stringify([type, id]);
}

function baseNode(
  type: OperatingNodeType,
  id: string,
  label: string,
  status: OperatingStatus,
  departmentId: string | null,
  summary: OperatingNode['summary'],
  tags: string[] = [],
): OperatingNode {
  return {
    id,
    type,
    label,
    status,
    departmentId,
    detailUrl: detailUrl(type, id),
    tags,
    health: { score: null, lastActivityAt: null },
    summary,
  };
}

function projectOperatingGraph(input: {
  workspaceId: string;
  departments: DepartmentRow[];
  agents: AgentRow[];
  workflows: WorkflowRow[];
  relationships: RelationshipRow[];
}): ProjectedOperatingGraph {
  const departmentIds = new Set(
    input.departments.map((department) => department.id),
  );
  const agentIds = new Set(input.agents.map((agent) => agent.id));

  const departmentNodes = input.departments.map((department) =>
    baseNode(
      'department',
      department.id,
      department.name,
      'healthy',
      department.id,
      {
        description: department.description,
        theme: department.theme,
        leaderAgentId:
          department.leaderAgentId && agentIds.has(department.leaderAgentId)
            ? department.leaderAgentId
            : null,
      },
      [department.slug, department.theme],
    ),
  );

  const agentNodes = input.agents.map((agent) => {
    const latestVersion = agent.versions[0];
    return baseNode(
      'agent',
      agent.id,
      agent.name,
      agent.isActive ? 'healthy' : 'offline',
      agent.departmentId && departmentIds.has(agent.departmentId)
        ? agent.departmentId
        : null,
      {
        description: agent.description,
        version: latestVersion?.version ?? null,
        model: latestVersion?.model.name ?? null,
        provider: latestVersion?.model.provider.name ?? null,
        toolCount: latestVersion?.tools.length ?? 0,
      },
      latestVersion?.tools.map(({ toolVersion }) => toolVersion.tool.name) ?? [],
    );
  });

  const workflowNodes = input.workflows.map((workflow) =>
    baseNode('workflow', workflow.id, workflow.name, 'healthy', null, {
      version: workflow.versions[0]?.version ?? null,
    }),
  );

  const nodes = [...departmentNodes, ...agentNodes, ...workflowNodes];
  const verifiedNodeKeys = new Set(
    nodes.map((node) => nodeKey(node.type, node.id)),
  );
  const edges: OperatingEdge[] = [];
  const endpointTypesByEdgeId = new Map<string, RelationshipEndpointTypes>();

  for (const relationship of input.relationships) {
    if (
      !NODE_TYPES.has(relationship.sourceType as OperatingNodeType) ||
      !NODE_TYPES.has(relationship.targetType as OperatingNodeType) ||
      !RELATIONSHIPS.has(relationship.relationship as OperatingRelationship)
    ) {
      continue;
    }

    const sourceType = relationship.sourceType as OperatingNodeType;
    const targetType = relationship.targetType as OperatingNodeType;
    if (
      !verifiedNodeKeys.has(nodeKey(sourceType, relationship.sourceId)) ||
      !verifiedNodeKeys.has(nodeKey(targetType, relationship.targetId))
    ) {
      continue;
    }

    edges.push({
      id: relationship.id,
      source: relationship.sourceId,
      target: relationship.targetId,
      relationship: relationship.relationship as OperatingRelationship,
      status: safeStatus(relationship.status),
      lastActivityAt: relationship.lastActivityAt?.toISOString() ?? null,
      intensity: safeIntensity(relationship.metadata),
    });
    endpointTypesByEdgeId.set(relationship.id, { sourceType, targetType });
  }

  const revisions = [
    ...input.departments,
    ...input.agents,
    ...input.workflows,
    ...input.relationships,
  ].map(({ updatedAt }) => updatedAt.getTime());

  return {
    snapshot: {
      revision: `${input.workspaceId}:${Math.max(0, ...revisions)}`,
      generatedAt: new Date().toISOString(),
      mode: 'live',
      nodes,
      edges,
    },
    endpointTypesByEdgeId,
  };
}

export class OperatingSystemRepository extends BaseRepository {
  private async getProjectedGraph(
    options: IRepositoryOptions,
  ): Promise<ProjectedOperatingGraph> {
    const db = this.getClient(options);
    const { workspaceId } = this.workspaceFilter(options.context);
    const { tenantId } = this.tenantFilter(options.context);

    const workspace = await db.workspace.findFirst({
      where: { id: workspaceId, tenantId },
      select: { id: true },
    });
    if (!workspace) {
      throw new Error('Workspace not found or unauthorized');
    }

    const [departments, agents, workflows, relationships] = await Promise.all([
      db.operatingDepartment.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          theme: true,
          leaderAgentId: true,
          updatedAt: true,
        },
      }),
      db.agent.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          departmentId: true,
          updatedAt: true,
          versions: {
            take: 1,
            orderBy: { version: 'desc' },
            select: {
              version: true,
              model: {
                select: {
                  name: true,
                  provider: { select: { name: true } },
                },
              },
              tools: {
                select: {
                  toolVersion: {
                    select: { tool: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      }),
      db.workflow.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          versions: {
            take: 1,
            orderBy: { version: 'desc' },
            select: { version: true },
          },
        },
      }),
      db.operatingGraphRelationship.findMany({
        where: { workspaceId },
        select: {
          id: true,
          sourceType: true,
          sourceId: true,
          targetType: true,
          targetId: true,
          relationship: true,
          status: true,
          metadata: true,
          lastActivityAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return projectOperatingGraph({
      workspaceId,
      departments,
      agents,
      workflows,
      relationships,
    });
  }

  async getGraphSnapshot(
    options: IRepositoryOptions,
  ): Promise<OperatingGraphSnapshot> {
    return (await this.getProjectedGraph(options)).snapshot;
  }

  async getEntityDetail(
    type: OperatingNodeType,
    id: string,
    options: IRepositoryOptions,
  ): Promise<EntityDetail | null> {
    const { snapshot, endpointTypesByEdgeId } =
      await this.getProjectedGraph(options);
    const node = snapshot.nodes.find(
      (candidate) => candidate.type === type && candidate.id === id,
    );
    if (!node) {
      return null;
    }

    return {
      node,
      metrics: { healthScore: node.health.score },
      relationships: snapshot.edges.filter((edge) => {
        const endpointTypes = endpointTypesByEdgeId.get(edge.id);
        return (
          (edge.source === id && endpointTypes?.sourceType === type) ||
          (edge.target === id && endpointTypes?.targetType === type)
        );
      }),
      actions: [{ id: 'view', label: 'View details', href: node.detailUrl }],
    };
  }
}
