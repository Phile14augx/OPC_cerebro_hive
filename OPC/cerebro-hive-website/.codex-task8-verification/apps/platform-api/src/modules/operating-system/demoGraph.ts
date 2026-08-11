import type {
  OperatingEdge,
  OperatingGraphSnapshot,
  OperatingNode,
  OperatingNodeType,
  OperatingRelationship,
} from '../../../../../packages/shared-types/src/domain/operating-system';

function demoNode(
  type: OperatingNodeType,
  id: string,
  label: string,
  departmentId: string | null = null,
): OperatingNode {
  return {
    id,
    type,
    label,
    status: 'healthy',
    departmentId,
    detailUrl: `/operating-system/${type}/${id}`,
    tags: [],
    health: { score: 100, lastActivityAt: '2026-08-09T00:00:00.000Z' },
    summary: {},
  };
}

function demoEdge(
  id: string,
  source: string,
  target: string,
  relationship: OperatingRelationship,
): OperatingEdge {
  return {
    id,
    source,
    target,
    relationship,
    status: 'healthy',
    lastActivityAt: '2026-08-09T00:00:00.000Z',
    intensity: 1,
  };
}

export function createDemoGraphSnapshot(): OperatingGraphSnapshot {
  const departmentId = 'demo-department-operations';
  const nodes: OperatingNode[] = [
    demoNode('department', departmentId, 'Operations', departmentId),
    demoNode('agent', 'demo-agent-coordinator', 'Operations Coordinator', departmentId),
    demoNode('tool', 'demo-tool-search', 'Company Search', departmentId),
    demoNode('model', 'demo-model-reasoning', 'Reasoning Model', departmentId),
    demoNode('skill', 'demo-skill-triage', 'Request Triage', departmentId),
    demoNode('data-source', 'demo-data-source-crm', 'Customer Records', departmentId),
    demoNode('memory', 'demo-memory-operations', 'Operations Memory', departmentId),
    demoNode('workflow', 'demo-workflow-intake', 'Customer Intake', departmentId),
    demoNode('task', 'demo-task-follow-up', 'Follow Up', departmentId),
    demoNode('output', 'demo-output-brief', 'Customer Brief', departmentId),
    demoNode('human', 'demo-human-operator', 'Operations Lead', departmentId),
    demoNode('system', 'demo-system-company-os', 'Company OS', departmentId),
    demoNode('integration', 'demo-integration-crm', 'CRM Integration', departmentId),
  ];

  const edges: OperatingEdge[] = [
    demoEdge('demo-edge-agent-department', 'demo-agent-coordinator', departmentId, 'REPORTS_TO'),
    demoEdge('demo-edge-agent-tool', 'demo-agent-coordinator', 'demo-tool-search', 'USES'),
    demoEdge('demo-edge-agent-model', 'demo-agent-coordinator', 'demo-model-reasoning', 'USES'),
    demoEdge('demo-edge-agent-skill', 'demo-agent-coordinator', 'demo-skill-triage', 'USES'),
    demoEdge('demo-edge-agent-data', 'demo-agent-coordinator', 'demo-data-source-crm', 'READS_FROM'),
    demoEdge('demo-edge-agent-memory', 'demo-agent-coordinator', 'demo-memory-operations', 'SHARES_MEMORY_WITH'),
    demoEdge('demo-edge-workflow-agent', 'demo-workflow-intake', 'demo-agent-coordinator', 'DELEGATES_TO'),
    demoEdge('demo-edge-workflow-task', 'demo-workflow-intake', 'demo-task-follow-up', 'TRIGGERS'),
    demoEdge('demo-edge-task-output', 'demo-task-follow-up', 'demo-output-brief', 'PRODUCES'),
    demoEdge('demo-edge-human-agent', 'demo-human-operator', 'demo-agent-coordinator', 'COLLABORATES_WITH'),
    demoEdge('demo-edge-system-integration', 'demo-system-company-os', 'demo-integration-crm', 'DEPENDS_ON'),
    demoEdge('demo-edge-integration-data', 'demo-integration-crm', 'demo-data-source-crm', 'WRITES_TO'),
  ];

  return {
    revision: 'demo-company-os-v1',
    generatedAt: '2026-08-09T00:00:00.000Z',
    mode: 'demo',
    nodes,
    edges,
  };
}
