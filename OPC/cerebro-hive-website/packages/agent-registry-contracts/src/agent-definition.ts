import { z } from 'zod';

export const StableReferencePattern = /^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9._/-]{0,127}$/;

const stableReference = z.string().regex(StableReferencePattern, 'must be a stable typed reference');
const draftReference = z.string().refine(value => value === '' || StableReferencePattern.test(value), 'must be empty or a stable typed reference');
const boundedText = z.string().max(50_000);
const draftText = boundedText;
const publishText = boundedText.refine(value => value.trim().length > 0, 'is required');

function jsonValueWithinBounds(value: unknown): boolean {
  const visit = (current: unknown, depth: number): boolean => {
    if (depth > 6) return false;
    if (current === null || ['string', 'number', 'boolean'].includes(typeof current)) return true;
    if (Array.isArray(current)) return current.length <= 50 && current.every(item => visit(item, depth + 1));
    if (typeof current !== 'object') return false;
    const entries = Object.entries(current as Record<string, unknown>);
    return entries.length <= 50
      && entries.every(([key, item]) => !key.startsWith('_') && key.length <= 128 && visit(item, depth + 1));
  };

  try {
    return JSON.stringify(value).length <= 16_384 && visit(value, 0);
  } catch {
    return false;
  }
}

const constraintsSchema = z.record(z.unknown()).refine(jsonValueWithinBounds, 'constraints exceed metadata bounds');

const draftModelConfig = z.object({
  providerRef: draftReference,
  modelRef: draftReference,
  temperature: z.number().finite().min(0).max(2),
  maxTokens: z.number().int().positive().max(1_000_000),
}).strict();

const publishModelConfig = draftModelConfig.extend({
  providerRef: stableReference,
  modelRef: stableReference,
}).strict();

const capability = (reference: z.ZodType<string>) => z.object({
  capabilityRef: reference,
  description: boundedText.optional(),
}).strict();

const actionDeclaration = (reference: z.ZodType<string>, description: z.ZodType<string>) => z.object({
  actionRef: reference,
  description,
}).strict();

const escalationRule = (reference: z.ZodType<string>, text: z.ZodType<string>) => z.object({
  ruleRef: reference,
  condition: text,
  action: z.enum(['REQUEST_APPROVAL', 'HANDOFF', 'REFUSE']),
  targetRef: reference.optional(),
  instructions: boundedText.optional(),
}).strict();

const toolPermission = (reference: z.ZodType<string>) => z.object({
  toolRef: reference,
  operations: z.array(z.string().trim().min(1).max(128)).max(50),
  constraints: constraintsSchema.optional(),
  justification: boundedText.optional(),
}).strict();

const knowledgeSource = (reference: z.ZodType<string>) => z.object({
  knowledgeSourceRef: reference,
  access: z.literal('READ'),
  purpose: boundedText.optional(),
}).strict();

export const AgentDraftDocumentV1Schema = z.object({
  schemaVersion: z.literal(1),
  purpose: draftText,
  businessFunction: draftText,
  responsibilities: z.array(draftText).max(50).default([]),
  expectedOutputs: z.array(draftText).max(50).default([]),
  systemInstructions: draftText,
  modelConfig: draftModelConfig,
  capabilities: z.array(capability(draftReference)).max(100).default([]),
  allowedActions: z.array(actionDeclaration(draftReference, draftText)).max(100).default([]),
  prohibitedActions: z.array(actionDeclaration(draftReference, draftText)).max(100).default([]),
  escalationRules: z.array(escalationRule(draftReference, draftText)).max(100).default([]),
  securityLevel: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  toolPermissions: z.array(toolPermission(draftReference)).max(100).default([]),
  knowledgeSources: z.array(knowledgeSource(draftReference)).max(100).default([]),
}).strict();

function addDuplicateIssues(
  values: readonly Record<string, unknown>[],
  key: string,
  collection: string,
  context: z.RefinementCtx,
) {
  const seen = new Set<string>();
  values.forEach((value, index) => {
    const reference = String(value[key]);
    if (seen.has(reference)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AGENT_DEFINITION_DUPLICATE_REFERENCE',
        path: [collection, index, key],
      });
    }
    seen.add(reference);
  });
}

export const AgentDefinitionV1Schema = AgentDraftDocumentV1Schema.extend({
  purpose: publishText,
  businessFunction: publishText,
  responsibilities: z.array(publishText).min(1).max(50),
  expectedOutputs: z.array(publishText).min(1).max(50),
  systemInstructions: publishText,
  modelConfig: publishModelConfig,
  capabilities: z.array(capability(stableReference)).max(100).default([]),
  allowedActions: z.array(actionDeclaration(stableReference, publishText)).max(100).default([]),
  prohibitedActions: z.array(actionDeclaration(stableReference, publishText)).max(100).default([]),
  escalationRules: z.array(escalationRule(stableReference, publishText)).max(100).default([]),
  toolPermissions: z.array(toolPermission(stableReference)).max(100).default([]),
  knowledgeSources: z.array(knowledgeSource(stableReference)).max(100).default([]),
}).strict().superRefine((definition, context) => {
  addDuplicateIssues(definition.capabilities, 'capabilityRef', 'capabilities', context);
  addDuplicateIssues(definition.allowedActions, 'actionRef', 'allowedActions', context);
  addDuplicateIssues(definition.prohibitedActions, 'actionRef', 'prohibitedActions', context);
  addDuplicateIssues(definition.escalationRules, 'ruleRef', 'escalationRules', context);
  addDuplicateIssues(definition.toolPermissions, 'toolRef', 'toolPermissions', context);
  addDuplicateIssues(definition.knowledgeSources, 'knowledgeSourceRef', 'knowledgeSources', context);

  const allowed = new Set(definition.allowedActions.map(action => action.actionRef));
  definition.prohibitedActions.forEach((action, index) => {
    if (allowed.has(action.actionRef)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AGENT_DEFINITION_ACTION_CONFLICT',
        path: ['prohibitedActions', index, 'actionRef'],
      });
    }
  });

  definition.escalationRules.forEach((rule, index) => {
    if (rule.action !== 'REFUSE' && !rule.targetRef) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AGENT_DEFINITION_ESCALATION_TARGET_REQUIRED',
        path: ['escalationRules', index, 'targetRef'],
      });
    }
  });

  definition.toolPermissions.forEach((permission, index) => {
    if (new Set(permission.operations).size !== permission.operations.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'AGENT_DEFINITION_DUPLICATE_OPERATION',
        path: ['toolPermissions', index, 'operations'],
      });
    }
  });
});

export type AgentDraftDocumentV1 = z.input<typeof AgentDraftDocumentV1Schema>;
export type AgentDefinitionV1 = z.output<typeof AgentDefinitionV1Schema>;

export interface DefinitionValidationError {
  code: string;
  path: string;
  message: string;
}

export type PublicationValidationResult =
  | { success: true; definition: AgentDefinitionV1; errors: [] }
  | { success: false; errors: DefinitionValidationError[] };

function issueCode(issue: z.ZodIssue): string {
  if (issue.code === z.ZodIssueCode.custom && issue.message.startsWith('AGENT_')) return issue.message;
  if (issue.message === 'is required') return 'AGENT_DEFINITION_REQUIRED';
  if (issue.code === z.ZodIssueCode.too_small) return 'AGENT_DEFINITION_REQUIRED';
  if (issue.code === z.ZodIssueCode.unrecognized_keys) return 'AGENT_DEFINITION_UNKNOWN_FIELD';
  if (issue.path.join('.').startsWith('modelConfig.')) return 'AGENT_DEFINITION_MODEL_CONFIG_INVALID';
  return 'AGENT_DEFINITION_INVALID';
}

export function validateForPublication(input: unknown): PublicationValidationResult {
  const result = AgentDefinitionV1Schema.safeParse(input);
  if (result.success) return { success: true, definition: result.data, errors: [] };

  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      code: issueCode(issue),
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

export const createInitialAgentDraft = (): AgentDraftDocumentV1 => ({
  schemaVersion: 1,
  purpose: '',
  businessFunction: '',
  responsibilities: [],
  expectedOutputs: [],
  systemInstructions: '',
  modelConfig: { providerRef: '', modelRef: '', temperature: 0.2, maxTokens: 4096 },
  capabilities: [],
  allowedActions: [],
  prohibitedActions: [],
  escalationRules: [],
  securityLevel: 'INTERNAL',
  toolPermissions: [],
  knowledgeSources: [],
});
