export const AgentIdParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', minLength: 1 } },
} as const;

export const AgentVersionParams = {
  type: 'object',
  required: ['id', 'versionId'],
  properties: { id: { type: 'string', minLength: 1 }, versionId: { type: 'string', minLength: 1 } },
} as const;

export const CreateAgentBody = {
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 5000 },
  },
} as const;

export const UpdateDraftBody = {
  type: 'object',
  required: ['expectedRevision', 'definition'],
  additionalProperties: false,
  properties: {
    expectedRevision: { type: 'integer', minimum: 1 },
    definition: { type: 'object', required: ['schemaVersion'], additionalProperties: true },
  },
} as const;

export const PublishDraftBody = {
  type: 'object',
  required: ['expectedDraftRevision'],
  additionalProperties: false,
  properties: { expectedDraftRevision: { type: 'integer', minimum: 1 } },
} as const;

export const LifecycleBody = {
  type: 'object',
  required: ['action'],
  additionalProperties: false,
  properties: {
    action: { type: 'string', enum: ['enter_sandbox', 'certify', 'promote_to_production', 'suspend', 'reactivate'] },
  },
} as const;
